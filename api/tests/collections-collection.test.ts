// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ findCollectionDetail: vi.fn() }));
vi.mock('../src/lib/collections-db.js', () => db);

import { buildApp } from '../src/app.js';
import { UpstreamUnavailableError } from '../src/lib/errors.js';

const route = '/v1-alpha/collections/cncf';

const row = {
  id: '0b6f3a4e-9c1d-4f2a-8e3b-5d7c9a1b2c3d',
  name: 'CNCF',
  slug: 'cncf',
  description: 'Cloud native projects.',
  ssoUserId: null,
  logoUrl: 'https://logos.test/cncf.png',
  imageUrl: '',
  color: '#0094FF',
  createdAt: new Date('2025-01-02T03:04:05Z'),
  updatedAt: new Date('2025-06-07T08:09:10Z'),
  ownerName: null,
  ownerLogo: null,
  projectCount: 2,
  repositoryCount: 1,
  likeCount: 7,
  featuredProjects: [{ name: 'Kubernetes', slug: 'kubernetes', logoUrl: '' }],
  projectIds: ['p1', 'p2'],
  repositoryUrls: ['https://github.com/cncf/landscape'],
};

let app: FastifyInstance;

beforeAll(async () => {
  vi.stubEnv('API_TB_HOST', 'https://tinybird.test');
  vi.stubEnv('API_TB_TOKEN', 'test-token');
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  vi.unstubAllEnvs();
});

beforeEach(() => {
  db.findCollectionDetail.mockReset();
  db.findCollectionDetail.mockResolvedValue(row);
});

describe('GET /v1-alpha/collections/{slug}', () => {
  it('returns the collection with its project ids and repository urls (AC1)', async () => {
    const res = await app.inject({ method: 'GET', url: route });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      id: row.id,
      name: 'CNCF',
      slug: 'cncf',
      description: 'Cloud native projects.',
      type: 'curated',
      projectCount: 2,
      repositoryCount: 1,
      likeCount: 7,
      featuredProjects: [{ name: 'Kubernetes', slug: 'kubernetes', logoUrl: null }],
      owner: null,
      logoUrl: 'https://logos.test/cncf.png',
      imageUrl: null,
      color: '#0094FF',
      createdAt: '2025-01-02T03:04:05.000Z',
      updatedAt: '2025-06-07T08:09:10.000Z',
      projectIds: ['p1', 'p2'],
      repositoryUrls: ['https://github.com/cncf/landscape'],
    });
    expect(db.findCollectionDetail).toHaveBeenCalledWith(expect.anything(), 'cncf');
  });

  it('answers 404 for an unknown or private slug (AC2)', async () => {
    db.findCollectionDetail.mockResolvedValue(null);

    const res = await app.inject({ method: 'GET', url: route });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'not_found' });
  });

  it('answers 503 when the database is unavailable (AC3)', async () => {
    db.findCollectionDetail.mockRejectedValue(new UpstreamUnavailableError());

    const res = await app.inject({ method: 'GET', url: route });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ code: 'upstream_unavailable' });
  });

  it('documents the route under Collections with the member lists (AC4)', () => {
    const op = app.swagger().paths?.['/v1-alpha/collections/{slug}']?.get;

    expect(op?.tags).toEqual(['Collections']);
    const response = op?.responses?.['200'] as unknown as {
      content: { 'application/json': { schema: { properties: object } } };
    };
    expect(Object.keys(response.content['application/json'].schema.properties)).toEqual(
      expect.arrayContaining(['name', 'projectIds', 'repositoryUrls']),
    );
  });
});
