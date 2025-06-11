// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import { DateTime } from "luxon";

const mockTinybirdBaseUrl = 'https://tb.lf.org';
const mockTinybirdToken = 'mockToken';

const mockTinybirdResult = {
  data: [{
    key: 'value',
  }],
  meta: [
    {
      name: "startDate",
      type: "Nullable(Date)"
    },
    {
      name: "endDate",
      type: "Nullable(Date)"
    },
    {
      name: "contributorCount",
      type: "UInt64"
    }
  ],
  rows: 13,
  statistics: {
    elapsed: 0.303075811,
    rows_read: 349219,
    bytes_read: 27822157
  }
};

const mockOfetch = vi.fn();

vi.mock('ofetch', () => ({
  ofetch: mockOfetch
}));

describe('fetchFromTinybird', () => {
  beforeEach(() => {
    process.env.NUXT_TINYBIRD_BASE_URL = mockTinybirdBaseUrl;
    process.env.NUXT_TINYBIRD_TOKEN = mockTinybirdToken;

    mockOfetch.mockClear();
    mockOfetch.mockResolvedValue(mockTinybirdResult);
  });

  afterAll(async () => {
    delete process.env.NUXT_TINYBIRD_BASE_URL;
    delete process.env.NUXT_TINYBIRD_TOKEN;
    vi.clearAllMocks();
  });

  it('should not send empty strings, undefined, or null values in the query', async () => {
    const { fetchFromTinybird } = await import('./tinybird');

    const query = {
      param1: 'value1',
      param2: '',
      param3: undefined,
      param4: null,
    };

    await fetchFromTinybird('/mock-path', query);

    const calledUrl = mockOfetch.mock.calls[0][0];
    expect(calledUrl).toMatch(`${mockTinybirdBaseUrl}/mock-path?param1=value1`);
    const calledOptions = mockOfetch.mock.calls[0][1];
    expect(calledOptions.headers).toEqual({ Authorization: `Bearer ${mockTinybirdToken}` });
  });

it('uses the default base URL if tinybirdBaseUrl is not defined', async () => {
  const { fetchFromTinybird } = await import('./tinybird');

  delete process.env.NUXT_TINYBIRD_BASE_URL;
  await fetchFromTinybird('/mock-path', { key: 'value' });
  const calledUrl = mockOfetch.mock.calls[0][0];
  expect(calledUrl).toBe('https://api.us-west-2.aws.tinybird.co/mock-path?key=value');
  process.env.NUXT_TINYBIRD_BASE_URL = mockTinybirdBaseUrl; // restore for other tests
});

  it('throws if tinybirdToken is not defined', async () => {
    const { fetchFromTinybird } = await import('./tinybird');

    delete process.env.NUXT_TINYBIRD_TOKEN;
    await expect(
      fetchFromTinybird('/mock-path', {key: 'value'})
    ).rejects.toThrowError('Tinybird token is not defined');
    process.env.NUXT_TINYBIRD_TOKEN = mockTinybirdToken; // restore for other tests
  });

  it('makes a request with the correct URL and query', async () => {
    const { fetchFromTinybird } = await import('./tinybird');

    const result = await fetchFromTinybird<{ key: string }>('/mock-path', {
      key: 'value',
    });

    const calledUrl = mockOfetch.mock.calls[0][0];
    expect(calledUrl).toBe(`${mockTinybirdBaseUrl}/mock-path?key=value`);
    const calledOptions = mockOfetch.mock.calls[0][1];
    expect(calledOptions.headers).toEqual({ Authorization: `Bearer ${mockTinybirdToken}` });
    expect(result).toEqual(mockTinybirdResult);
  });

    it('should correctly format DateTime objects in the query', async () => {
      const { fetchFromTinybird } = await import('./tinybird');

      const query = {
        dateParam: DateTime.fromISO('2025-03-20T12:30:00'),
      };

      await fetchFromTinybird('/mock-path', query);

      const calledUrl = mockOfetch.mock.calls[0][0];
      expect(calledUrl).toEqual(`${mockTinybirdBaseUrl}/mock-path?dateParam=2025-03-20+00%3A00%3A00`);
      const calledOptions = mockOfetch.mock.calls[0][1];
      expect(calledOptions.headers).toEqual({ Authorization: `Bearer ${mockTinybirdToken}` });
    });
});
