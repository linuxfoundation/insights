// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTinybirdClient } from '../src/client.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const BASE_URL = 'https://tb.test';
const TOKEN = 'test-token';

const mockResult = {
  data: [{ key: 'value' }],
  meta: [{ name: 'key', type: 'String' }],
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

describe('createTinybirdClient — fetch()', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(okResponse(mockResult));
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('makes a GET request with correct URL and auth header', async () => {
    const client = createTinybirdClient({ baseUrl: BASE_URL, token: TOKEN });

    const result = await client.fetch('/mock-path', { key: 'value' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/mock-path?key=value`);
    expect((init.headers as Record<string, string>)['Authorization']).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual(mockResult);
  });

  it('omits undefined, null, and empty-string query values', async () => {
    const client = createTinybirdClient({ baseUrl: BASE_URL, token: TOKEN });

    await client.fetch('/mock-path', {
      param1: 'value1',
      param2: '',
      param3: undefined,
      param4: null,
    });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe(`${BASE_URL}/mock-path?param1=value1`);
  });

  it('encodes array values with raw commas (required by Tinybird Array() params)', async () => {
    const client = createTinybirdClient({ baseUrl: BASE_URL, token: TOKEN });

    await client.fetch('/mock-path', { ids: ['a', 'b', 'c'] });

    const [url] = mockFetch.mock.calls[0] as [string];
    // Tinybird expects raw commas between array elements, not %2C
    expect(url).toContain('ids=a,b,c');
  });

  it('uses default base URL when none provided', async () => {
    const client = createTinybirdClient({
      baseUrl: 'https://api.us-west-2.aws.tinybird.co',
      token: TOKEN,
    });

    await client.fetch('/mock-path', { key: 'value' });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe('https://api.us-west-2.aws.tinybird.co/mock-path?key=value');
  });

  it('throws TinybirdClientError on non-2xx response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Internal Server Error'),
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const client = createTinybirdClient({ baseUrl: BASE_URL, token: TOKEN });

    await expect(client.fetch('/mock-path', {})).rejects.toMatchObject({ statusCode: 500 });
  });
});
