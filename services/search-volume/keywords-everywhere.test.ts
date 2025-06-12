// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSearchVolume, DEFAULT_API_KEY, DEFAULT_API_URL } from './keywords-everywhere'; // Adjust the import path
import { $fetch } from 'ofetch';

// Mock the $fetch function using Vitest's vi.mock
vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}));

const mockFetcher = vi.mocked($fetch);

describe('getSearchVolume', () => {
  const mockKeywords = ['typescript', 'javascript'];
  const mockApiKey = 'test-api-key';
  const mockApiUrl = 'https://test.api.com/data';

  beforeEach(() => {
    // Reset the mock before each test
    mockFetcher.mockReset();
    // For environment variables, Vitest offers vi.stubEnv and vi.unstubAllEnvs
    // which is cleaner than directly manipulating process.env.
    // We'll use it in tests that rely on default env vars.
    vi.unstubAllEnvs(); // Clear any previous stubs
  });

  it('should return data on successful API call with default options', async () => {
    const mockResponse = {
      credits: 100,
      credits_consumed: 10,
      data: [{ keyword: 'typescript', vol: 1000 }],
    };
    mockFetcher.mockResolvedValue(mockResponse);

    // Stub environment variable for this test
    vi.stubEnv('KEYWORDS_EVERYWHERE_API_KEY', mockApiKey);

    const result = await getSearchVolume(mockKeywords);

    expect(mockFetcher).toHaveBeenCalledWith(
      DEFAULT_API_URL, // Uses default URL
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`, // Uses default (stubbed) API key
        },
        body: expect.any(URLSearchParams),
      })
    );
    const bodyParams = new URLSearchParams(mockFetcher.mock.calls[0][1].body);
    expect(bodyParams.getAll('kw[]')).toEqual(mockKeywords);
    expect(bodyParams.get('dataSource')).toBe('gkp');
    expect(result).toEqual(mockResponse);
  });

  it('should return data on successful API call with custom options', async () => {
    const mockResponse = {
      data: [{ keyword: 'javascript', vol: 2000 }],
    };
    mockFetcher.mockResolvedValue(mockResponse);

    const result = await getSearchVolume(mockKeywords, {
      fetcher: mockFetcher,
      apiKey: mockApiKey,
      apiUrl: mockApiUrl,
    });

    expect(mockFetcher).toHaveBeenCalledWith(
      mockApiUrl,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`,
        },
        body: expect.any(URLSearchParams),
      })
    );
    const bodyParams = new URLSearchParams(mockFetcher.mock.calls[0][1].body);
    expect(bodyParams.getAll('kw[]')).toEqual(mockKeywords);
    expect(bodyParams.get('dataSource')).toBe('gkp');
    expect(result).toEqual(mockResponse);
  });

  it('should return null if API call fails', async () => {
    mockFetcher.mockRejectedValue(new Error('API Error'));

    const result = await getSearchVolume(mockKeywords, {
      fetcher: mockFetcher,
      apiKey: mockApiKey,
      apiUrl: mockApiUrl,
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('should return null if API call fails with error response', async () => {
    const errorResponse = {
        message: "API Error",
        response: {
            status: 500,
            text: async () => "Internal Server Error"
        }
    };
    mockFetcher.mockRejectedValue(errorResponse);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getSearchVolume(mockKeywords, {
        fetcher: mockFetcher,
        apiKey: mockApiKey,
        apiUrl: mockApiUrl,
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Error calling Keywords Everywhere API: API Error"));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Response status: 500"));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Response content: Internal Server Error"));

    consoleErrorSpy.mockRestore();
  });


  it('should throw an error if API key is not provided and not in env', async () => {
    // vi.unstubAllEnvs() in beforeEach handles clearing env stubs.
    // Ensure KEYWORDS_EVERYWHERE_API_KEY is not set by not stubbing it.

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(getSearchVolume(mockKeywords, { fetcher: mockFetcher, apiUrl: mockApiUrl /* apiKey is omitted */ })).rejects.toThrow(
      'KEYWORDS_EVERYWHERE_API_KEY not found.'
    );

    expect(mockFetcher).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("KEYWORDS_EVERYWHERE_API_KEY not found.");

    consoleErrorSpy.mockRestore();
  });

  it('should return empty data if keywords array is empty', async () => {
    const result = await getSearchVolume([], {
      fetcher: mockFetcher,
      apiKey: mockApiKey,
      apiUrl: mockApiUrl,
    });

    expect(result).toEqual({ data: [] });
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should return empty data if keywords array is null', async () => {
    const result = await getSearchVolume(null as any, { // Cast to any to test this case
      fetcher: mockFetcher,
      apiKey: mockApiKey,
      apiUrl: mockApiUrl,
    });

    expect(result).toEqual({ data: [] });
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should use default API URL and key if not provided in options', async () => {
    const mockResponse = { data: [] };
    mockFetcher.mockResolvedValue(mockResponse);

    // Stub environment variable for default API key
    vi.stubEnv('KEYWORDS_EVERYWHERE_API_KEY', 'env-api-key');

    await getSearchVolume(mockKeywords, { fetcher: mockFetcher });

    expect(mockFetcher).toHaveBeenCalledWith(
      DEFAULT_API_URL, // Default URL
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer env-api-key`, // Default key from stubbed env
        }),
      })
    );
    // vi.unstubAllEnvs() in beforeEach will clean this up.
  });
});