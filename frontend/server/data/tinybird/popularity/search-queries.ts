// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { SearchVolumeFilter } from '../../types';
import { fetchFromTinybird } from '../tinybird';
import type { SearchQueries } from '~~/types/popularity/responses.types';
import type { TinybirdSearchVolumeData } from '~~/server/data/tinybird/responses.types';
import type { SearchVolumeTinybirdQuery } from '~~/server/data/tinybird/requests.types';

export async function fetchSearchVolume(filter: SearchVolumeFilter): Promise<SearchQueries> {
  const query: SearchVolumeTinybirdQuery = {
    project: filter.project,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const data = await fetchFromTinybird<TinybirdSearchVolumeData[]>(
    `/v0/pipes/search_volume.json`,
    query,
  );

  return {
    data: data.data.map((item) => ({
      startDate: item.dataTimestamp,
      endDate: DateTime.fromISO(item.dataTimestamp).endOf('month').toFormat('yyyy-MM-dd'),
      queryCount: item.volume,
    })),
  };
}
