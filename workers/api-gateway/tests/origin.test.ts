// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { expect, it, vi } from 'vitest';

import type { Env } from '../src/env';
import { callOrigin } from '../src/origin';

it('sends the origin request through the VPC binding when it is bound', async () => {
  const fetcher = vi.fn(async (_request: Request) => new Response('via vpc'));
  const env = { INSIGHTS_API: { fetch: fetcher } } as unknown as Env;
  const request = new Request(
    'http://insights-api-svc.insights.svc.cluster.local:4000/v1-alpha/projects',
  );

  const response = await callOrigin(request, env);

  expect(fetcher).toHaveBeenCalledWith(request);
  expect(await response.text()).toBe('via vpc');
});
