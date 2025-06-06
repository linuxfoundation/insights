// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const stars: BenchmarkConfigs = {
  title: 'Github Stars',
  key: BenchmarkKeys.Stars,
  points: [
    {
      pointStart: 0,
      pointEnd: 9,
      type: 'negative',
      description: '{value} GitHub stars',
      text: `This project has very low visibility. Keep in mind, however, 
      that star counts can be influenced by factors other than 
      genuine community engagement.`,
      points: 0
    },
    {
      pointStart: 10,
      pointEnd: 49,
      type: 'negative',
      description: '{value} GitHub stars',
      text: `This project has low visibility, though star counts may not 
      fully capture its actual usage or value and can be 
      susceptible to targeted promotion.`,
      points: 1
    },
    {
      pointStart: 50,
      pointEnd: 199,
      type: 'warning',
      description: '{value} GitHub stars',
      text: `This project has moderate visibility, but remember that stars 
      can be affected by promotional efforts and may not represent sustained 
      interest over time.`,
      points: 2
    },
    {
      pointStart: 200,
      pointEnd: 499,
      type: 'warning',
      description: '{value} GitHub stars',
      text: `This project has good visibility. However, note that high star 
      counts can sometimes be boosted by short-term trends 
      or social media campaigns.`,
      points: 3
    },
    {
      pointStart: 500,
      pointEnd: 999,
      type: 'positive',
      description: '{value} GitHub stars',
      text: `This project has great visibility, though stars should be 
      considered alongside other metrics to avoid potential 
      gaming of the system.`,
      points: 4
    },
    {
      pointStart: 1000,
      pointEnd: null,
      type: 'positive',
      description: '{value} GitHub stars',
      text: `This project has great visibility on GitHub. It's important 
      to assess this in context, as star counts can be artificially inflated.`,
      points: 5
    }
  ],
  visibilityCheck: () => true
};
