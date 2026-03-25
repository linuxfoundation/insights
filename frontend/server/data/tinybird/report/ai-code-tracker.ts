// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { DateTime } from 'luxon';
import { fetchFromTinybird } from '../tinybird';
import type {
  AiToolTimeSeriesDataPoint,
  PeriodTotalCommits,
  AiCodeTrackerResponse,
} from '~~/types/report/ai-code-tracker.types';

interface TinybirdAiToolItem {
  toolKey: string;
  toolName: string;
  startDate: string;
  endDate: string;
  commitCount: number;
}

interface TinybirdTotalCommitsItem {
  startDate: string;
  totalCommits: number;
}

export interface AiCodeTrackerFilter {
  granularity: string;
  startDate?: DateTime;
  endDate?: DateTime;
}

export async function fetchAiCodeTrackerData(
  filter: AiCodeTrackerFilter,
): Promise<AiCodeTrackerResponse> {
  const query = {
    granularity: filter.granularity || 'monthly',
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const [toolData, totalData] = await Promise.all([
    fetchFromTinybird<TinybirdAiToolItem[]>('/v0/pipes/ai_code_tracker.json', query),
    fetchFromTinybird<TinybirdTotalCommitsItem[]>(
      '/v0/pipes/ai_code_tracker_total_commits.json',
      query,
    ),
  ]);

  const data: AiToolTimeSeriesDataPoint[] = toolData.data.map((item) => ({
    startDate: item.startDate,
    endDate: item.endDate,
    toolKey: item.toolKey,
    toolName: item.toolName,
    commitCount: item.commitCount,
  }));

  const periodTotals: PeriodTotalCommits[] = totalData.data.map((item) => ({
    startDate: item.startDate,
    totalCommits: item.totalCommits,
  }));

  return { data, periodTotals };
}
