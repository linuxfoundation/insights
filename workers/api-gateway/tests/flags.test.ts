// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../src/env';
import { fetchAdminUsernames, targetedUsernames, type FlagConfig } from '../src/flags';

const flag: FlagConfig = {
  on: true,
  variations: [true, false],
  targets: [
    { values: ['jdoe', 'asmith'], variation: 0 },
    { values: ['blocked'], variation: 1 },
  ],
  contextTargets: [
    { contextKind: 'user', values: ['ctx-user'], variation: 0 },
    { contextKind: 'org', values: ['acme'], variation: 0 },
  ],
};

afterEach(() => vi.unstubAllGlobals());

describe('targetedUsernames', () => {
  it('returns user keys targeted with true', () => {
    expect(targetedUsernames(flag)).toEqual(['jdoe', 'asmith', 'ctx-user']);
  });

  it('returns nothing when the flag is off', () => {
    expect(targetedUsernames({ ...flag, on: false })).toEqual([]);
  });
});

describe('fetchAdminUsernames', () => {
  it('fetches the flag with the SDK key, reuses it, and keeps it through an outage', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      Response.json(flag),
    );
    vi.stubGlobal('fetch', fetchMock);
    const env = {
      LD_SDK_KEY: 'sdk-test',
      LD_FLAG_URL: 'https://sdk.launchdarkly.test/sdk/latest-flags/insights-public-api',
    } as Env;

    expect(await fetchAdminUsernames(env)).toContain('jdoe');
    await fetchAdminUsernames(env);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      'https://sdk.launchdarkly.test/sdk/latest-flags/insights-public-api',
    );
    expect(new Headers(fetchMock.mock.calls[0]![1]!.headers).get('authorization')).toBe('sdk-test');

    vi.advanceTimersByTime(61_000);
    fetchMock.mockImplementation(async () => new Response('down', { status: 503 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await fetchAdminUsernames(env)).toContain('jdoe');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
