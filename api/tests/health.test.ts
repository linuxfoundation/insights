// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const pg = vi.hoisted(() => ({
  query: vi.fn(),
  end: vi.fn(),
  options: [] as unknown[],
}));

vi.mock('@lfx-insights/postgres-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lfx-insights/postgres-client')>()),
  createPostgresPool: (options: unknown) => {
    pg.options.push(options);
    return { query: pg.query, end: pg.end };
  },
}));

import { buildApp } from '../src/app.js';
import { closeCmPool, queryCm } from '../src/clients/postgres.js';
import { UpstreamUnavailableError } from '../src/lib/errors.js';

const cmEnv = {
  API_CM_DB_HOST: 'cm.test',
  API_CM_DB_DATABASE: 'crowd-web',
  API_CM_DB_USERNAME: 'reader',
  API_CM_DB_PASSWORD: 'secret',
};

const stubCmEnv = () => {
  for (const [name, value] of Object.entries(cmEnv)) {
    vi.stubEnv(name, value);
  }
};

const log = { log: { error: vi.fn() } } as never;

beforeEach(() => {
  pg.query.mockReset();
  pg.end.mockReset();
  pg.options.length = 0;
});

afterEach(async () => {
  await closeCmPool();
  vi.unstubAllEnvs();
});

describe('health routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers live without touching the database', async () => {
    const response = await app.inject({ method: 'GET', url: '/health/live' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    expect(pg.query).not.toHaveBeenCalled();
  });

  it('is ready when the CM database answers', async () => {
    stubCmEnv();
    pg.query.mockResolvedValue({ rows: [] });

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', postgres: 'up' });
    expect(pg.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('is unavailable when the CM database fails', async () => {
    stubCmEnv();
    pg.query.mockRejectedValue(new Error('connection refused'));

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'unavailable', postgres: 'down' });
  });

  it('is unavailable when the CM database is not configured', async () => {
    vi.stubEnv('API_CM_DB_HOST', '');

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(503);
    expect(pg.options).toEqual([]);
  });

  it('stays out of the OpenAPI documents', () => {
    const paths = Object.keys(app.swagger().paths ?? {});

    expect(paths.filter((path) => path.startsWith('/health/'))).toEqual([]);
  });
});

describe('getCmPool', () => {
  it('reads the API_CM_DB_* variables, with TLS on and port 5432 by default', async () => {
    stubCmEnv();
    pg.query.mockResolvedValue({ rows: [] });

    await queryCm(log, 'SELECT 1');

    expect(pg.options).toEqual([
      {
        host: 'cm.test',
        port: 5432,
        database: 'crowd-web',
        user: 'reader',
        password: 'secret',
        ssl: true,
      },
    ]);
  });

  it('turns TLS off with API_CM_DB_SSL=false', async () => {
    stubCmEnv();
    vi.stubEnv('API_CM_DB_SSL', 'false');
    vi.stubEnv('API_CM_DB_PORT', '6543');
    pg.query.mockResolvedValue({ rows: [] });

    await queryCm(log, 'SELECT 1');

    expect(pg.options[0]).toMatchObject({ port: 6543, ssl: false });
  });
});

describe('queryCm', () => {
  it('returns the rows of the query', async () => {
    stubCmEnv();
    pg.query.mockResolvedValue({ rows: [{ id: 'a' }] });

    await expect(
      queryCm(log, 'SELECT id FROM collections WHERE slug = $1', ['cncf']),
    ).resolves.toEqual([{ id: 'a' }]);
    expect(pg.query).toHaveBeenCalledWith('SELECT id FROM collections WHERE slug = $1', ['cncf']);
  });

  it('turns a driver failure into a 503', async () => {
    stubCmEnv();
    pg.query.mockRejectedValue(new Error('relation "collections" does not exist'));

    await expect(queryCm(log, 'SELECT 1')).rejects.toBeInstanceOf(UpstreamUnavailableError);
  });

  it('turns missing configuration into a 503', async () => {
    await expect(queryCm(log, 'SELECT 1')).rejects.toBeInstanceOf(UpstreamUnavailableError);
    expect(pg.options).toEqual([]);
  });
});
