// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const contributionOutsideWorkHours: BenchmarkConfigs = {
  title: 'Contributions Outside Work Hours',
  key: BenchmarkKeys.ContributionsOutsideWorkHours,
  points: [
    {
      pointStart: 75,
      pointEnd: null,
      type: 'negative',
      description: '{value}% of contributions occur outside regular working hours',
      text: `This project mostly depends on contributors working outside of working hours.`,
      points: 0
    },
    {
      pointStart: 50,
      pointEnd: 74,
      type: 'negative',
      description: '{value}% of contributions occur outside regular working hours',
      text: `This project highly depends on contributors working outside of working hours.`,
      points: 1
    },
    {
      pointStart: 40,
      pointEnd: 49,
      type: 'warning',
      description: '{value}% of contributions occur outside regular working hours',
      text: `This project depends on contributors working outside of working hours.`,
      points: 2
    },
    {
      pointStart: 30,
      pointEnd: 39,
      type: 'warning',
      description: '{value}% of contributions occur outside regular working hours',
      text: `Contributions are mostly made during working hours.`,
      points: 3
    },
    {
      pointStart: 20,
      pointEnd: 29,
      type: 'positive',
      description: '{value}% of contributions occur outside regular working hours',
      text: `Most of the contributions are made during working hours, 
      indicating a healthy & sustainable development process.`,
      points: 4
    },
    {
      pointStart: 0,
      pointEnd: 19,
      type: 'positive',
      description: '{value}% of contributions occur outside regular working hours',
      text: `Almost all contributions are made during working hours, 
      indicating a very healthy & sustainable development process.`,
      points: 5
    }
  ],
  visibilityCheck: () => true
};
