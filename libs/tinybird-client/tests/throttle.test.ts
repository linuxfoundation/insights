// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TinybirdQueueFullError } from '../src/errors.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockAcquire = vi.fn().mockResolvedValue(false);
const mockRelease = vi.fn();
const mockReportRateLimit = vi.fn();

vi.mock('../src/adaptive-semaphore.js', () => ({
  AdaptiveSemaphore: class {
    acquire = mockAcquire;
    release = mockRelease;
    reportTinybirdRateLimit = mockReportRateLimit;
    getActive = vi.fn().mockReturnValue(0);
    getQueueLength = vi.fn().mockReturnValue(0);
  },
}));

const mockResult = {
  data: [{ key: 'value' }],
  meta: [],
  rows: 1,
  statistics: { elapsed: 0.1, rows_read: 100, bytes_read: 1000 },
};

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('fetchFromTinybird throttle behavior', () => {
  beforeEach(async () => {
    mockFetch.mockReset().mockResolvedValue(okResponse(mockResult));
    mockAcquire.mockReset().mockResolvedValue(false);
    mockRelease.mockReset();
    mockReportRateLimit.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('calls release() after a successful request', async () => {
    const { createTinybirdClient } = await import('../src/client.js');
    const client = createTinybirdClient({ baseUrl: 'https://tb.test', token: 'tok' });

    await client.fetch('/v0/pipes/test.json', { key: 'value' });

    expect(mockAcquire).toHaveBeenCalledOnce();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it('calls release() even when the request fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const { createTinybirdClient } = await import('../src/client.js');
    const client = createTinybirdClient({ baseUrl: 'https://tb.test', token: 'tok' });

    await expect(client.fetch('/v0/pipes/test.json', { key: 'value' })).rejects.toBeDefined();

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it('calls reportTinybirdRateLimit() on 429 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const { createTinybirdClient } = await import('../src/client.js');
    const client = createTinybirdClient({ baseUrl: 'https://tb.test', token: 'tok' });

    await expect(client.fetch('/v0/pipes/test.json', { key: 'value' })).rejects.toBeDefined();

    expect(mockReportRateLimit).toHaveBeenCalledOnce();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it('does not call reportTinybirdRateLimit() on non-429 errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const { createTinybirdClient } = await import('../src/client.js');
    const client = createTinybirdClient({ baseUrl: 'https://tb.test', token: 'tok' });

    await expect(client.fetch('/v0/pipes/test.json', { key: 'value' })).rejects.toBeDefined();

    expect(mockReportRateLimit).not.toHaveBeenCalled();
  });

  it('propagates 503 when acquire rejects (queue full)', async () => {
    mockAcquire.mockRejectedValue(new TinybirdQueueFullError());

    const { createTinybirdClient } = await import('../src/client.js');
    const client = createTinybirdClient({ baseUrl: 'https://tb.test', token: 'tok' });

    await expect(client.fetch('/v0/pipes/test.json', { key: 'value' })).rejects.toMatchObject({
      statusCode: 503,
    });

    // release() must NOT be called — no slot was acquired
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('skips semaphore for ping and bucket lookup paths', async () => {
    const { createTinybirdClient } = await import('../src/client.js');
    const client = createTinybirdClient({ baseUrl: 'https://tb.test', token: 'tok' });

    await client.fetch('/v0/pipes/ping.json', {});
    expect(mockAcquire).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();

    mockAcquire.mockClear();
    mockRelease.mockClear();

    await client.fetch('/v0/pipes/project_buckets.json', {});
    expect(mockAcquire).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });
});
