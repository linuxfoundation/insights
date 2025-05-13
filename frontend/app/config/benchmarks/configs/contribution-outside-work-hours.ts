// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const contributionOutsideWorkHours: BenchmarkConfigs = {
  title: 'Contributions Outside Work Hours',
  key: BenchmarkKeys.ContributionsOutsideWorkHours,
  points: [
    {
      pointStart: 80,
      pointEnd: null,
      type: 'negative',
      description: '80%+ of contributions',
      text: `80%+ of contributions occur outside regular working hours`,
      points: 0
    },
    {
      pointStart: 60,
      pointEnd: 79,
      type: 'negative',
      description: '60–79% of contributions',
      text: `60–79% of contributions occur outside regular working hours`,
      points: 1
    },
    {
      pointStart: 40,
      pointEnd: 59,
      type: 'warning',
      description: '40–59% of contributions',
      text: `40–59% of contributions occur outside regular working hours`,
      points: 2
    },
    {
      pointStart: 25,
      pointEnd: 39,
      type: 'warning',
      description: '25–39% of contributions',
      text: `25–39% of contributions occur outside regular working hours`,
      points: 3
    },
    {
      pointStart: 10,
      pointEnd: 24,
      type: 'positive',
      description: '10–24% of contributions',
      text: `10–24% of contributions occur outside regular working hours`,
      points: 4
    },
    {
      pointStart: 0,
      pointEnd: 9,
      type: 'positive',
      description: 'Less than 10%',
      text: `Less than 10% outside working hours`,
      points: 5
    }
  ],
  visibilityCheck: () => true
};
