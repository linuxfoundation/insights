// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const searchQueries: BenchmarkConfigs = {
  title: 'Search Queries',
  key: BenchmarkKeys.SearchQueries,
  points: [
    {
      pointStart: 0,
      pointEnd: 9,
      type: 'negative',
      description: '{value} queries per month',
      text: `This project has extremely low online search visibility, 
      suggesting minimal public awareness or interest.`,
      points: 0
    },
    {
      pointStart: 10,
      pointEnd: 49,
      type: 'negative',
      description: '{value} queries per month',
      text: `This project receives very limited search volume, 
      indicating low general awareness and engagement.`,
      points: 1
    },
    {
      pointStart: 50,
      pointEnd: 199,
      type: 'warning',
      description: '{value} queries per month',
      text: `This project shows modest online interest, with a small but 
      growing presence in search queries.`,
      points: 2
    },
    {
      pointStart: 200,
      pointEnd: 499,
      type: 'warning',
      description: '{value} queries per month',
      text: `This project enjoys a fair level of search interest, reflecting 
      moderate public awareness and community engagement.`,
      points: 3
    },
    {
      pointStart: 500,
      pointEnd: 999,
      type: 'positive',
      description: '{value} queries per month',
      text: `This project benefits from strong search volume, indicating 
      significant recognition and a healthy level of public interest.`,
      points: 4
    },
    {
      pointStart: 1000,
      pointEnd: null,
      type: 'positive',
      description: '{value} queries per month',
      text: `This project exhibits exceptional search interest, demonstrating high visibility 
      and widespread public engagement. Note that search volumes can be influenced by 
      trends or external factors, so it should be considered alongside other metrics.`,
      points: 5
    }
  ],
  visibilityCheck: () => true
};
