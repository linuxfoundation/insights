// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import { DateTime } from "luxon";
import { mockSearchVolumeResponse } from '../../mocks/tinybird-search-volume-response.mock';
import type { SearchQueries } from "~~/types/popularity/responses.types";
import type { SearchVolumeFilter } from "~~/server/data/types";
import type {TinybirdSearchVolumeData} from "~~/server/data/tinybird/responses.types";

const mockFetchFromTinybird = vi.fn();

describe('Search queries Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside the data source module would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  test('should fetch search volume data when given the correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchSearchVolume} = await import("~~/server/data/tinybird/search-queries-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockSearchVolumeResponse);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: SearchVolumeFilter = {
      keyword: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchSearchVolume(filter);

    const expectedTinybirdPath = '/v0/pipes/search_volume.json';

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(expectedTinybirdPath, filter);

    const expectedResult: TinybirdSearchVolumeData[] = mockSearchVolumeResponse.data.map((item, index) => ({
      dataTimestamp: DateTime.fromISO(item.dataTimestamp),
      volume: item.volume,
      sortId: index + 1, // Assuming sortId is just an index for sorting
    }));

    expect(result).toEqual(expectedResult);
  });
});
