// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOfetch = vi.fn();
const mockAcquire = vi.fn().mockResolvedValue(false);
const mockRelease = vi.fn();
const mockReportRateLimit = vi.fn();

vi.mock('ofetch', () => ({ ofetch: mockOfetch }));
vi.mock('./adaptive-semaphore', () => ({
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

describe('fetchFromTinybird throttle behavior', () => {
  beforeEach(() => {
    process.env.NUXT_TINYBIRD_BASE_URL = 'https://tb.test';
    process.env.NUXT_TINYBIRD_TOKEN = 'test-token';
    mockOfetch.mockReset();
    mockAcquire.mockReset().mockResolvedValue(false);
    mockRelease.mockReset();
    mockReportRateLimit.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    delete process.env.NUXT_TINYBIRD_BASE_URL;
    delete process.env.NUXT_TINYBIRD_TOKEN;
    vi.restoreAllMocks();
  });

  it('calls release() after a successful request', async () => {
    mockOfetch.mockResolvedValue(mockResult);
    const { fetchFromTinybird } = await import('./tinybird');

    await fetchFromTinybird('/v0/pipes/test.json', { key: 'value' });

    expect(mockAcquire).toHaveBeenCalledOnce();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it('calls release() even when the request fails', async () => {
    mockOfetch.mockRejectedValue(new Error('network error'));
    const { fetchFromTinybird } = await import('./tinybird');

    await expect(fetchFromTinybird('/v0/pipes/test.json', { key: 'value' })).rejects.toThrow();

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it('calls reportTinybirdRateLimit() on 429 response', async () => {
    const error429 = Object.assign(new Error('Too Many Requests'), { status: 429 });
    mockOfetch.mockRejectedValue(error429);
    const { fetchFromTinybird } = await import('./tinybird');

    await expect(fetchFromTinybird('/v0/pipes/test.json', { key: 'value' })).rejects.toThrow();

    expect(mockReportRateLimit).toHaveBeenCalledOnce();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it('does not call reportTinybirdRateLimit() on non-429 errors', async () => {
    const error500 = Object.assign(new Error('Server Error'), { status: 500 });
    mockOfetch.mockRejectedValue(error500);
    const { fetchFromTinybird } = await import('./tinybird');

    await expect(fetchFromTinybird('/v0/pipes/test.json', { key: 'value' })).rejects.toThrow();

    expect(mockReportRateLimit).not.toHaveBeenCalled();
  });

  it('propagates 503 when acquire rejects (queue full)', async () => {
    mockAcquire.mockRejectedValue(
      createError({
        statusCode: 503,
        statusMessage: 'Tinybird request queue full — try again shortly',
      }),
    );
    const { fetchFromTinybird } = await import('./tinybird');

    await expect(fetchFromTinybird('/v0/pipes/test.json', { key: 'value' })).rejects.toMatchObject({
      statusCode: 503,
    });

    // release() should NOT be called — no slot was acquired
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('skips semaphore for ping and bucket lookup paths', async () => {
    mockOfetch.mockResolvedValue(mockResult);
    const { fetchFromTinybird } = await import('./tinybird');

    await fetchFromTinybird('/v0/pipes/ping.json', {});
    expect(mockAcquire).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();

    mockAcquire.mockClear();
    mockRelease.mockClear();

    await fetchFromTinybird('/v0/pipes/project_buckets.json', {});
    expect(mockAcquire).not.toHaveBeenCalled();
    expect(mockRelease).not.toHaveBeenCalled();
  });
});
