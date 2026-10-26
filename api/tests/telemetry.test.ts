// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BuildAppOptions } from '../src/app.js';
import { USERNAME_CLAIM } from '../src/auth.js';
import { fetchPipe, withBucket } from '../src/clients/tinybird.js';
import { localKeys, sign, useAuthApp } from './helpers/auth.js';
import { bucketsPath, mockFetch, tinybirdHost, tinybirdStub } from './helpers/tinybird.js';

// The tracer is never initialized under test, so these spy on its no-op methods.
const setUser = vi.spyOn(tracer, 'setUser');
const trace = vi.spyOn(tracer, 'trace');

const pipePath = '/v0/pipes/active_days.json';

const projects: BuildAppOptions['versions'] = [
  {
    prefix: '/v1-alpha',
    plugin: async (scope) => {
      scope.get('/projects/:slug', async (request) => ({ username: request.username }));
      scope.get('/projects/:slug/active-days', async (request) => {
        const { slug } = request.params as { slug: string };
        return withBucket(request, slug, (bucketId) =>
          fetchPipe(request, pipePath, { project: slug, bucketId }),
        );
      });
    },
  },
];

const bearer = async (username: string) =>
  `Bearer ${await sign({ claims: { [USERNAME_CLAIM]: username } })}`;

describe('request telemetry', () => {
  const get = useAuthApp(
    { authKeys: localKeys, versions: projects },
    { API_TB_HOST: tinybirdHost, API_TB_TOKEN: 'test-token' },
  );

  beforeEach(() => {
    setUser.mockClear();
    trace.mockClear();
  });

  it('tags the trace with the caller LFID and tier', async () => {
    const token = await bearer('jdoe');

    await get('/v1-alpha/projects/kubernetes', token);
    await get('/v1-alpha/projects/kubernetes', token, { 'x-tier': 'gold' });

    expect(setUser.mock.calls).toEqual([
      [{ id: 'jdoe', tier: 'basic' }],
      [{ id: 'jdoe', tier: 'premium' }],
    ]);
  });

  it('leaves the trace untagged for a rejected token', async () => {
    expect((await get('/v1-alpha/projects/kubernetes')).statusCode).toBe(401);

    expect(setUser).not.toHaveBeenCalled();
  });

  it('leaves the trace untagged while auth is disabled, since there is no caller', async () => {
    vi.stubEnv('API_AUTH_DISABLED', 'true');

    expect((await get('/v1-alpha/projects/kubernetes')).statusCode).toBe(200);

    expect(setUser).not.toHaveBeenCalled();
  });

  it('wraps each Tinybird call in a span named by pipe, with the bucket when there is one', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => []));

    const response = await get('/v1-alpha/projects/kubernetes/active-days', await bearer('jdoe'));

    expect(response.statusCode).toBe(200);
    expect(trace.mock.calls.map(([name, options]) => [name, options])).toEqual([
      ['tinybird.query', { resource: bucketsPath, tags: { pipe: bucketsPath } }],
      ['tinybird.query', { resource: pipePath, tags: { pipe: pipePath, bucket_id: 7 } }],
    ]);
  });
});
