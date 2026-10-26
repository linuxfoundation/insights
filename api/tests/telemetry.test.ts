// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BuildAppOptions } from '../src/app.js';
import { USERNAME_CLAIM } from '../src/auth.js';
import { REQUESTS_METRIC } from '../src/telemetry.js';
import { localKeys, sign, useAuthApp } from './helpers/auth.js';

// The tracer is never initialized under test, so these spy on its no-op methods.
const setUser = vi.spyOn(tracer, 'setUser');
const increment = vi.spyOn(tracer.dogstatsd, 'increment');

const projects: BuildAppOptions['versions'] = [
  {
    prefix: '/v1-alpha',
    plugin: async (scope) => {
      scope.get('/projects/:slug', async (request) => ({ username: request.username }));
    },
  },
];

const bearer = async (username: string) =>
  `Bearer ${await sign({ claims: { [USERNAME_CLAIM]: username } })}`;

describe('request telemetry', () => {
  const get = useAuthApp({ authKeys: localKeys, versions: projects });

  beforeEach(() => {
    setUser.mockClear();
    increment.mockClear();
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

  it('counts each request by route template, status, LFID and tier', async () => {
    const token = await bearer('jdoe');

    await get('/v1-alpha/projects/kubernetes', token, { 'x-tier': 'gold' });

    expect(increment).toHaveBeenCalledExactlyOnceWith(REQUESTS_METRIC, 1, {
      'http.route': '/v1-alpha/projects/:slug',
      'http.status_code': 200,
      'usr.id': 'jdoe',
      'usr.tier': 'premium',
    });
  });

  it('leaves a request with a rejected token untagged and uncounted', async () => {
    expect((await get('/v1-alpha/projects/kubernetes')).statusCode).toBe(401);

    expect(setUser).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
  });

  it('leaves requests untagged and uncounted while auth is disabled, since there is no caller', async () => {
    vi.stubEnv('API_AUTH_DISABLED', 'true');

    expect((await get('/v1-alpha/projects/kubernetes')).statusCode).toBe(200);

    expect(setUser).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
  });
});
