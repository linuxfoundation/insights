// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BuildAppOptions } from '../src/app.js';
import { fetchPipe, withBucket } from '../src/clients/tinybird.js';
import { localKeys, sign, useAuthApp } from './helpers/auth.js';
import {
  bucketsPath,
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
});
