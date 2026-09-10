// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DateTime } from 'luxon';

// Mock the entire lib so the shim is isolated
const mockClientFetch = vi.fn();
const mockClientPost = vi.fn();
const mockClientIngest = vi.fn();

vi.mock('@lfx-insights/tinybird-client', () => ({
  createTinybirdClient: () => ({
    fetch: mockClientFetch,
    post: mockClientPost,
    ingest: mockClientIngest,
    getBucketIdForProject: vi.fn(),
  }),
  TinybirdClientError: class TinybirdClientError extends Error {
    constructor(
      public statusCode: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

const mockResult = {
  data: [{ key: 'value' }],
  meta: [{ name: 'key', type: 'String' }],
  rows: 1,
  statistics: { elapsed: 0.1, rows_read: 100, bytes_read: 1000 },
};

describe('fetchFromTinybird shim', () => {
  beforeEach(() => {
    mockClientFetch.mockReset().mockResolvedValue(mockResult);
    mockClientPost.mockReset().mockResolvedValue(mockResult);
    mockClientIngest.mockReset().mockResolvedValue(true);
  });

  it('passes query through to the client', async () => {
    const { fetchFromTinybird } = await import('./tinybird');

    await fetchFromTinybird('/mock-path', { key: 'value' });

    expect(mockClientFetch).toHaveBeenCalledWith('/mock-path', { key: 'value' });
  });

  it('serializes DateTime values to tinybird date strings', async () => {
    const { fetchFromTinybird } = await import('./tinybird');

    await fetchFromTinybird('/mock-path', {
      dateParam: DateTime.fromISO('2025-03-20T12:30:00'),
    });

    const [, query] = mockClientFetch.mock.calls[0] as [string, Record<string, unknown>];
    expect(query.dateParam).toBe('2025-03-20 00:00:00');
  });

  it('passes undefined/null values through (client filters them)', async () => {
    const { fetchFromTinybird } = await import('./tinybird');

    await fetchFromTinybird('/mock-path', {
      present: 'yes',
      missing: undefined,
      empty: null,
    });

    const [, query] = mockClientFetch.mock.calls[0] as [string, Record<string, unknown>];
    expect(query.present).toBe('yes');
    expect(query.missing).toBeUndefined();
    expect(query.empty).toBeNull();
  });

  it('re-throws TinybirdClientError as H3 createError with the same statusCode', async () => {
    const { TinybirdClientError } = await import('@lfx-insights/tinybird-client');
    mockClientFetch.mockRejectedValue(new TinybirdClientError(429, 'rate limited'));

    const { fetchFromTinybird } = await import('./tinybird');

    await expect(fetchFromTinybird('/mock-path', {})).rejects.toMatchObject({
      statusCode: 429,
    });
  });

  it('re-throws non-TinybirdClientError errors unchanged', async () => {
    const original = new Error('network failure');
    mockClientFetch.mockRejectedValue(original);

    const { fetchFromTinybird } = await import('./tinybird');

    await expect(fetchFromTinybird('/mock-path', {})).rejects.toThrow('network failure');
  });
});

describe('postToTinybird shim', () => {
  beforeEach(() => {
    mockClientFetch.mockReset().mockResolvedValue(mockResult);
    mockClientPost.mockReset().mockResolvedValue(mockResult);
    mockClientIngest.mockReset().mockResolvedValue(true);
  });

  it('passes params through to the client and serializes DateTime values', async () => {
    const { postToTinybird } = await import('./tinybird');

    const result = await postToTinybird('/mock-path', {
      key: 'value',
      dateParam: DateTime.fromISO('2025-03-20T12:30:00'),
    });

    expect(mockClientPost).toHaveBeenCalledWith('/mock-path', {
      key: 'value',
      dateParam: '2025-03-20 00:00:00',
    });
    expect(result).toBe(mockResult);
  });

  it('re-throws TinybirdClientError as H3 createError with the same statusCode', async () => {
    const { TinybirdClientError } = await import('@lfx-insights/tinybird-client');
    mockClientPost.mockRejectedValue(new TinybirdClientError(429, 'rate limited'));

    const { postToTinybird } = await import('./tinybird');

    await expect(postToTinybird('/mock-path', {})).rejects.toMatchObject({
      statusCode: 429,
    });
  });

  it('re-throws non-TinybirdClientError errors unchanged', async () => {
    const original = new Error('network failure');
    mockClientPost.mockRejectedValue(original);

    const { postToTinybird } = await import('./tinybird');

    await expect(postToTinybird('/mock-path', {})).rejects.toThrow('network failure');
  });
});

describe('addDataToTinybirdDatasource shim', () => {
  beforeEach(() => {
    mockClientFetch.mockReset().mockResolvedValue(mockResult);
    mockClientPost.mockReset().mockResolvedValue(mockResult);
    mockClientIngest.mockReset().mockResolvedValue(true);
  });

  it('passes datasource and data through to the client', async () => {
    const { addDataToTinybirdDatasource } = await import('./tinybird');

    const result = await addDataToTinybirdDatasource('my_datasource', { foo: 'bar' });

    expect(mockClientIngest).toHaveBeenCalledWith('my_datasource', { foo: 'bar' });
    expect(result).toBe(true);
  });

  it('re-throws TinybirdClientError as H3 createError with the same statusCode', async () => {
    const { TinybirdClientError } = await import('@lfx-insights/tinybird-client');
    mockClientIngest.mockRejectedValue(new TinybirdClientError(503, 'unavailable'));

    const { addDataToTinybirdDatasource } = await import('./tinybird');

    await expect(addDataToTinybirdDatasource('my_datasource', {})).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('re-throws non-TinybirdClientError errors unchanged', async () => {
    const original = new Error('network failure');
    mockClientIngest.mockRejectedValue(original);

    const { addDataToTinybirdDatasource } = await import('./tinybird');

    await expect(addDataToTinybirdDatasource('my_datasource', {})).rejects.toThrow(
      'network failure',
    );
  });
});
