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
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import {DateTime} from "luxon";
import { fetchFromTinybird } from './tinybird';

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
const mockFetch = vi.fn().mockResolvedValue(mockTinybirdResult);
vi.stubGlobal('$fetch', mockFetch);

/** This is how we mock the useRuntimeConfig function in Nuxt,
 *  according to https://nuxt.com/docs/getting-started/testing#mocknuxtimport
 *  This is the second method described in the docs, which allows us to define different values for each test.
 *  See setMockRuntimeConfig() below for how to do that.
 */
const { useRuntimeConfigMock } = vi.hoisted(() => ({
    useRuntimeConfigMock: vi.fn(() => ({
    tinybirdBaseUrl: mockTinybirdBaseUrl as string | null,
    tinybirdToken: mockTinybirdToken as string | null,
  }))
}));

/**
 * This allows setting a different runtimeConfig for each test.
 * Call it with the desired values at the start of the test, or wherever it makes sense.
 */
function setMockRuntimeConfig(tinybirdBaseUrl: string | null, tinybirdToken: string | null) {
  useRuntimeConfigMock.mockImplementation(() => ({
    tinybirdBaseUrl,
    tinybirdToken,
  }));

  mockNuxtImport('useRuntimeConfig', () => useRuntimeConfigMock);
}

describe('fetchFromTinybird', () => {
  beforeEach(() => {
    setMockRuntimeConfig(mockTinybirdBaseUrl, mockTinybirdToken);
  });

  afterAll(async () => {
    useRuntimeConfigMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should not send empty strings, undefined, or null values in the query', async () => {
    const query = {
      param1: 'value1',
      param2: '',
      param3: undefined,
      param4: null,
    };

    await fetchFromTinybird('/mock-path', query);

    expect(mockFetch).toHaveBeenCalledWith(
      `${mockTinybirdBaseUrl}/mock-path`,
      expect.objectContaining({
        query: { param1: 'value1' },
        headers: { Authorization: `Bearer ${mockTinybirdToken}` },
      })
    );
  });

  it('throws if tinybirdBaseUrl is not defined', async () => {
    setMockRuntimeConfig(null, 'mockToken');
    await expect(
      fetchFromTinybird('/mock-path', {key: 'value'})
    ).rejects.toThrowError('Tinybird base URL is not defined');
  });

  it('throws if tinybirdToken is not defined', async () => {
    setMockRuntimeConfig(mockTinybirdBaseUrl, null);
    await expect(
      fetchFromTinybird('/mock-path', {key: 'value'})
    ).rejects.toThrowError('Tinybird token is not defined');
  });

  it('makes a request with the correct URL and query', async () => {
    const result = await fetchFromTinybird<{ key: string }>('/mock-path', {
      key: 'value',
    });

    expect($fetch).toHaveBeenCalledWith(`${mockTinybirdBaseUrl}/mock-path`, {
      query: {key: 'value'}, headers: {Authorization: `Bearer ${mockTinybirdToken}`}
    });
    expect(result).toEqual(mockTinybirdResult);
  });

    it('should correctly format DateTime objects in the query', async () => {
      const query = {
        dateParam: DateTime.fromISO('2025-03-20T12:30:00'),
      };

      await fetchFromTinybird('/mock-path', query);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockTinybirdBaseUrl}/mock-path`,
        expect.objectContaining({
          query: { dateParam: '2025-03-20 00:00:00' },
          headers: { Authorization: `Bearer ${mockTinybirdToken}` },
        })
      );
    });
});
