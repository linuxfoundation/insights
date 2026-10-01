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

const stubAllEnv = () => {
  stubCmEnv();
  vi.stubEnv('API_TB_TOKEN', 'token');
  vi.stubEnv('API_TB_HOST', 'https://tinybird.test');
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

  it('is ready when every upstream is configured', async () => {
    stubAllEnv();

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('stays ready while the CM database is down, since every pod shares it', async () => {
    stubAllEnv();
    pg.query.mockRejectedValue(new Error('connection refused'));

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(200);
    expect(pg.query).not.toHaveBeenCalled();
    expect(pg.options).toEqual([]);
  });

  it('names the missing variables when the pod is misconfigured', async () => {
    stubAllEnv();
    vi.stubEnv('API_CM_DB_PASSWORD', '');
    vi.stubEnv('API_TB_TOKEN', '');

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'unavailable',
      missingConfig: ['API_CM_DB_PASSWORD', 'API_TB_TOKEN'],
      invalidConfig: [],
    });
  });

  it('treats an empty API_CM_DB_PORT as the default', async () => {
    stubAllEnv();
    vi.stubEnv('API_CM_DB_PORT', '');

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(200);
  });

  it.each(['abc', '0', '70000', '54.3'])('reports API_CM_DB_PORT=%s as invalid', async (port) => {
    stubAllEnv();
    vi.stubEnv('API_CM_DB_PORT', port);

    const response = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'unavailable',
      missingConfig: [],
      invalidConfig: ['API_CM_DB_PORT'],
    });
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

  it('falls back to port 5432 when API_CM_DB_PORT is empty', async () => {
    stubCmEnv();
    vi.stubEnv('API_CM_DB_PORT', '');
    pg.query.mockResolvedValue({ rows: [] });

    await queryCm(log, 'SELECT 1');

    expect(pg.options[0]).toMatchObject({ port: 5432 });
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
  it('turns an invalid port into a 503', async () => {
    stubCmEnv();
    vi.stubEnv('API_CM_DB_PORT', 'abc');

    await expect(queryCm(log, 'SELECT 1')).rejects.toBeInstanceOf(UpstreamUnavailableError);
    expect(pg.options).toEqual([]);
  });

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
