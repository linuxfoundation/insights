// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from 'vitest';

import { buildApp, type BuildAppOptions } from '../src/app.js';
import { fetchPipe, useTinybirdLog } from '../src/clients/tinybird.js';
import { useAuthApp } from './helpers/auth.js';
import { mockFetch, tinybirdHost } from './helpers/tinybird.js';

const projects: BuildAppOptions['versions'] = [
  {
    prefix: '/v1-alpha',
    plugin: async (scope) => {
      scope.get('/projects/:slug/stars', async (request) => {
        const { slug } = request.params as { slug: string };
        return fetchPipe(request, '/v0/pipes/stars.json', { slug });
      });
    },
  },
];

describe('Tinybird client logging', () => {
  const get = useAuthApp(
    { versions: projects },
    { API_AUTH_DISABLED: 'true', API_TB_HOST: tinybirdHost, API_TB_TOKEN: 'test-token' },
  );

  it('sends the client lines to the app logger, with JSON events as fields', async () => {
    const log = { warn: vi.fn(), error: vi.fn() };
    useTinybirdLog(log as never);
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    expect((await get('/v1-alpha/projects/kubernetes/stars')).statusCode).toBe(503);

    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({ pipe: '/v0/pipes/stars.json', params: { slug: 'kubernetes' } }),
      'tinybird_request_error',
    );
    expect(log.warn).not.toHaveBeenCalled();
  });
});

describe('app logger', () => {
  it('configures request logging without the deprecated Fastify option', async () => {
    const emitWarning = vi.spyOn(process, 'emitWarning');

    const app = await buildApp({ versions: [] });
    await app.close();

    expect(JSON.stringify(emitWarning.mock.calls)).not.toContain('FSTDEP023');
    emitWarning.mockRestore();
  });
});
