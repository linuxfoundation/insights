// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import type { FastifyBaseLogger } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BuildAppOptions } from '../src/app.js';
import { fetchPipe, withBucket } from '../src/clients/tinybird.js';
import { UpstreamUnavailableError } from '../src/lib/errors.js';
import { localKeys, sign, useAuthApp } from './helpers/auth.js';
import {
  bucketsPath,
  collectionBucketsPath,
  mockFetch,
  tinybirdError,
  tinybirdHost,
  tinybirdResponse,
  tinybirdStub,
} from './helpers/tinybird.js';

// The tracer is never initialized under test, so these spy on its no-op DogStatsD client.
const increment = vi.spyOn(tracer.dogstatsd, 'increment');
const distribution = vi.spyOn(tracer.dogstatsd, 'distribution');

const pipePath = '/v0/pipes/stars.json';

const projects: BuildAppOptions['versions'] = [
  {
    prefix: '/v1-alpha',
    plugin: async (scope) => {
      scope.get('/projects/:slug', async (request) => ({ username: request.username }));
      scope.get('/projects/:slug/stars', async (request) =>
        fetchPipe(request, pipePath, { slug: (request.params as { slug: string }).slug }),
      );
      scope.get('/projects/:slug/collection-scoped', async (request) =>
        fetchPipe(request, pipePath, {
          collectionSlug: (request.params as { slug: string }).slug,
        }),
      );
      scope.get('/projects/:slug/guarded', async (request) =>
        fetchPipe<{ count: number }>(
          request,
          pipePath,
          { slug: (request.params as { slug: string }).slug },
          (row) => typeof row.count === 'number',
        ),
      );
      scope.get('/projects/:slug/bucketed', async (request) => {
        const { slug } = request.params as { slug: string };
        return withBucket(request, slug, (bucketId) =>
          fetchPipe(request, pipePath, { project: slug, bucketId }),
        );
      });
    },
  },
];

const calls = (spy: typeof increment | typeof distribution, metric: string) =>
  spy.mock.calls.filter(([name]) => name === metric).map(([, value, tags]) => [value, tags]);

describe('custom metrics', () => {
  const get = useAuthApp(
    { authKeys: localKeys, versions: projects },
    { API_TB_HOST: tinybirdHost, API_TB_TOKEN: 'test-token' },
  );

  beforeEach(() => {
    increment.mockClear();
    distribution.mockClear();
  });

  it('counts and times each request by endpoint, version, status class and tier', async () => {
    await get('/v1-alpha/projects/kubernetes', `Bearer ${await sign()}`, { 'x-tier': 'gold' });

    const tags = {
      endpoint: '/v1-alpha/projects/:slug',
      version: 'v1-alpha',
      status_class: '2xx',
      tier: 'premium',
    };
    expect(calls(increment, 'insights.api.request.count')).toEqual([[1, tags]]);
    expect(calls(distribution, 'insights.api.request.duration')).toEqual([
      [expect.any(Number), tags],
    ]);
  });

  it('tags a request without a verified caller with tier none', async () => {
    await get('/v1-alpha/projects/kubernetes');

    expect(calls(increment, 'insights.api.request.count')).toEqual([
      [
        1,
        {
          endpoint: '/v1-alpha/projects/:slug',
          version: 'v1-alpha',
          status_class: '4xx',
          tier: 'none',
        },
      ],
    ]);
  });

  it('counts auth failures by reason', async () => {
    const expired = await sign({ exp: Math.floor(Date.now() / 1000) - 60 });
    const wrongAudience = await sign({ aud: 'https://elsewhere.test/' });

    await get('/v1-alpha/projects/kubernetes');
    await get('/v1-alpha/projects/kubernetes', `Bearer ${expired}`);
    await get('/v1-alpha/projects/kubernetes', `Bearer ${wrongAudience}`);
    await get(
      '/v1-alpha/projects/kubernetes',
      `Bearer ${await sign({ claims: { 'http://lfx.dev/claims/username': '' } })}`,
    );

    expect(calls(increment, 'insights.api.auth.failures')).toEqual([
      [1, { reason: 'missing' }],
      [1, { reason: 'expired' }],
      [1, { reason: 'invalid_jwt' }],
      [1, { reason: 'invalid_jwt' }],
    ]);
  });

  it('times each Tinybird call by pipe and counts failures by type', async () => {
    const token = `Bearer ${await sign()}`;
    mockFetch.mockResolvedValueOnce(tinybirdResponse([]));
    await get('/v1-alpha/projects/kubernetes/stars', token);
    mockFetch.mockImplementation(async () => tinybirdError(400));
    await get('/v1-alpha/projects/kubernetes/stars', token);

    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: pipePath, status_class: '2xx' }],
      [expect.any(Number), { pipe: pipePath, status_class: '4xx' }],
    ]);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: pipePath, error_type: 'http' }],
    ]);
  });

  it('times a bucket lookup once, however many requests it serves from cache', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => []));
    const token = `Bearer ${await sign()}`;

    await get('/v1-alpha/projects/metrics-bucket/bucketed', token);
    await get('/v1-alpha/projects/metrics-bucket/bucketed', token);

    const durations = calls(distribution, 'insights.api.tinybird.duration');
    const tagged = (pipe: string) =>
      durations.filter(([, tags]) => (tags as { pipe: string }).pipe === pipe);
    expect(tagged(bucketsPath)).toEqual([
      [expect.any(Number), { pipe: bucketsPath, status_class: '2xx' }],
    ]);
    expect(tagged(pipePath)).toHaveLength(2);
  });

  it('counts a failed bucket lookup once, however many callers share it', async () => {
    mockFetch.mockImplementation(async () => tinybirdError(500));
    const request = { log: { error: vi.fn(), warn: vi.fn() } } as unknown as {
      log: FastifyBaseLogger;
    };

    const results = await Promise.allSettled([
      withBucket(request, 'shared-failure', () => Promise.resolve(1)),
      withBucket(request, 'shared-failure', () => Promise.resolve(1)),
    ]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
    for (const result of results) {
      expect((result as PromiseRejectedResult).reason).toBeInstanceOf(UpstreamUnavailableError);
    }
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: bucketsPath, error_type: 'http' }],
    ]);
    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: bucketsPath, status_class: '5xx' }],
    ]);
  });

  it('counts a malformed shared bucket lookup once', async () => {
    mockFetch.mockImplementation(async () => tinybirdResponse([{ bucketId: 'x' }]));
    const request = { log: { error: vi.fn(), warn: vi.fn() } } as unknown as {
      log: FastifyBaseLogger;
    };

    const results = await Promise.allSettled([
      withBucket(request, 'shared-malformed', () => Promise.resolve(1)),
      withBucket(request, 'shared-malformed', () => Promise.resolve(1)),
    ]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: bucketsPath, error_type: 'invalid_response' }],
    ]);
    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: bucketsPath, status_class: '2xx' }],
    ]);
  });

  it('attributes a failed collection bucket lookup to the bucket pipe', async () => {
    mockFetch.mockImplementation(async () => tinybirdError(500));

    const res = await get(
      '/v1-alpha/projects/failing-collection/collection-scoped',
      `Bearer ${await sign()}`,
    );

    expect(res.statusCode).toBe(503);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: collectionBucketsPath, error_type: 'http' }],
    ]);
    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: collectionBucketsPath, status_class: '5xx' }],
    ]);
  });

  it('counts rows of an unexpected shape once, against the pipe that returned them', async () => {
    mockFetch.mockImplementation(async () => tinybirdResponse([{ count: 'x' }]));

    const res = await get('/v1-alpha/projects/bad-rows/guarded', `Bearer ${await sign()}`);

    expect(res.statusCode).toBe(503);
    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: pipePath, status_class: '2xx' }],
    ]);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: pipePath, error_type: 'invalid_response' }],
    ]);
  });

  it('keeps a malformed 2xx body in the 2xx class', async () => {
    mockFetch.mockImplementation(async () => new Response('not json', { status: 200 }));

    const res = await get('/v1-alpha/projects/bad-body/stars', `Bearer ${await sign()}`);

    expect(res.statusCode).toBe(503);
    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: pipePath, status_class: '2xx' }],
    ]);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: pipePath, error_type: 'invalid_response' }],
    ]);
  });

  it('times a request the local queue rejected as an error', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockFetch.mockImplementation(() => gate.then(() => tinybirdResponse([])));
    const request = { log: { error: vi.fn(), warn: vi.fn() } } as unknown as {
      log: FastifyBaseLogger;
    };

    // The API's cap of 5 concurrent requests plus the client's default queue of 500.
    const held = Array.from({ length: 5 + 500 }, () => fetchPipe(request, pipePath, {}));
    await expect(fetchPipe(request, pipePath, {})).rejects.toBeInstanceOf(UpstreamUnavailableError);

    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: pipePath, status_class: 'error' }],
    ]);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: pipePath, error_type: 'queue_full' }],
    ]);

    release();
    await Promise.all(held);
  });

  it('counts a bucket lookup network failure once, as the request that failed', async () => {
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    const res = await get('/v1-alpha/projects/offline/bucketed', `Bearer ${await sign()}`);

    expect(res.statusCode).toBe(503);
    expect(calls(increment, 'insights.api.tinybird.errors')).toEqual([
      [1, { pipe: bucketsPath, error_type: 'network' }],
    ]);
    expect(calls(distribution, 'insights.api.tinybird.duration')).toEqual([
      [expect.any(Number), { pipe: bucketsPath, status_class: 'error' }],
    ]);
  });
});
