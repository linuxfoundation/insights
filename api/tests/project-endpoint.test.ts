// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { versionRegistry } from '../src/versions/registry.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

// A projects_list row with details=true carries far more than the endpoint returns.
const kubernetesRow = {
  id: 'b4a5c1e2',
  name: 'Kubernetes',
  slug: 'kubernetes',
  description: 'Production-grade container orchestration',
  logo: 'https://example.org/k8s.png',
  isLF: 1,
  contributorCount: 1200,
  organizationCount: 300,
  repositories: [k8sRepo, websiteRepo],
  archivedRepositories: [websiteRepo],
  excludedRepositories: [],
  connectedPlatforms: ['github', 'git'],
  repoData: [[k8sRepo, '90', '1']],
  repoLicenses: [[k8sRepo, 'Apache-2.0']],
  widgets: ['commitActivities'],
  status: 'active',
};

const tinybirdRows = (rows: object[]) => async () =>
  new Response(
    JSON.stringify({
      data: rows,
      meta: [],
      rows: rows.length,
      statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

interface OpenApiSchema {
  type?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
}

interface OpenApiOperation {
  tags?: string[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

interface OpenApiDoc {
  info: { version: string };
  paths: Record<string, { get?: OpenApiOperation }>;
}

let app: FastifyInstance;

beforeAll(async () => {
  vi.stubEnv('API_TB_HOST', tinybirdHost);
  vi.stubEnv('API_TB_TOKEN', 'test-token');
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  vi.unstubAllEnvs();
});

beforeEach(() => {
  mockFetch.mockReset().mockImplementation(tinybirdRows([kubernetesRow]));
});

const get = (url: string) => app.inject({ method: 'GET', url });

describe('GET /v1-alpha/projects/{slug} (AC1, AC8)', () => {
  it('returns the name, repository URLs and connected platforms', async () => {
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      slug: 'kubernetes',
      name: 'Kubernetes',
      repositories: [{ url: k8sRepo }, { url: websiteRepo }],
      connectedPlatforms: ['github', 'git'],
    });
  });

  it('returns only the four documented keys, dropping the rest of the pipe row', async () => {
    const res = await get('/v1-alpha/projects/kubernetes');
    const body = res.json<{ repositories: object[] }>();
    expect(Object.keys(body).sort()).toEqual(
      ['connectedPlatforms', 'name', 'repositories', 'slug'].sort(),
    );
    for (const repo of body.repositories) {
      expect(Object.keys(repo)).toEqual(['url']);
    }
  });
});

describe('Tinybird call (AC2)', () => {
  it('makes one projects_list call with the slug and details=true', async () => {
    await get('/v1-alpha/projects/kubernetes');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = new URL(String(mockFetch.mock.calls[0]?.[0]));
    expect(url.origin).toBe(tinybirdHost);
    expect(url.pathname).toBe('/v0/pipes/projects_list.json');
    expect(url.searchParams.get('slug')).toBe('kubernetes');
    expect(url.searchParams.get('details')).toBe('true');
  });
});

describe('platform and repository edge cases (AC3)', () => {
  it('strips the -nango suffix and drops the duplicates it leaves, keeping pipe order', async () => {
    mockFetch.mockImplementation(
      tinybirdRows([{ ...kubernetesRow, connectedPlatforms: ['github-nango', 'git', 'github'] }]),
    );
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(200);
    expect(res.json().connectedPlatforms).toEqual(['github', 'git']);
  });

  it('returns an empty platform list when the pipe sends none', async () => {
    mockFetch.mockImplementation(tinybirdRows([{ ...kubernetesRow, connectedPlatforms: [] }]));
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(200);
    expect(res.json().connectedPlatforms).toEqual([]);
  });

  it('returns empty lists when the pipe omits platforms and repositories', async () => {
    const { connectedPlatforms: _p, repositories: _r, ...bareRow } = kubernetesRow;
    mockFetch.mockImplementation(tinybirdRows([bareRow]));
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ repositories: [], connectedPlatforms: [] });
  });
});

describe('unknown slug (AC4)', () => {
  it('returns 404 not_found when the pipe has no row for the slug', async () => {
    mockFetch.mockImplementation(tinybirdRows([]));
    const res = await get('/v1-alpha/projects/no-such-project');
    expect(res.statusCode).toBe(404);
    expect(res.json().code).toBe('not_found');
  });
});

describe('Tinybird failures (AC5)', () => {
  const upstreamDetail = 'tinybird internal detail';

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [500, 'Internal Server Error'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])('maps a Tinybird %i to 503 upstream_unavailable', async (status, statusText) => {
    mockFetch.mockImplementation(async () => new Response(upstreamDetail, { status, statusText }));
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a network error to 503 upstream_unavailable', async () => {
    mockFetch.mockRejectedValue(new TypeError(`fetch failed: ${upstreamDetail}`));
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a response that is not JSON to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(async () => new Response('<html>oops</html>', { status: 200 }));
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });
});

describe('caching headers (AC6)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get('/v1-alpha/projects/kubernetes');
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('sets the same header on an error response, per docs/site/errors.md', async () => {
    mockFetch.mockImplementation(tinybirdRows([]));
    const res = await get('/v1-alpha/projects/no-such-project');
    expect(res.statusCode).toBe(404);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('/v1-alpha registration and spec (AC7)', () => {
  const routePath = '/v1-alpha/projects/{slug}';

  async function getSpec(url: string): Promise<OpenApiDoc> {
    const res = await get(url);
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>();
  }

  it('registers /v1-alpha in the version registry', () => {
    expect(versionRegistry.map((entry) => entry.prefix)).toContain('/v1-alpha');
  });

  it('serves /v1-alpha/openapi.json as 1.0.0-alpha with the route tagged Projects', async () => {
    const spec = await getSpec('/v1-alpha/openapi.json');
    expect(spec.info.version).toBe('1.0.0-alpha');
    expect(spec.paths[routePath]?.get?.tags).toEqual(['Projects']);
  });

  it('documents every field of the 200 response', async () => {
    const spec = await getSpec('/v1-alpha/openapi.json');
    const schema =
      spec.paths[routePath]?.get?.responses['200']?.content['application/json']?.schema;
    const fields = ['slug', 'name', 'repositories', 'connectedPlatforms'];
    expect(schema?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
  });

  it('keeps the route out of /v1', async () => {
    const spec = await getSpec('/v1/openapi.json');
    expect(Object.keys(spec.paths)).not.toContain('/v1/projects/{slug}');
    expect(Object.keys(spec.paths)).not.toContain(routePath);
    const res = await get('/v1/projects/kubernetes');
    expect(res.statusCode).toBe(404);
  });
});
