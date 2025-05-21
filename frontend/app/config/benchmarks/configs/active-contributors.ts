// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const activeContributors: BenchmarkConfigs = {
  title: 'Quarterly Active Contributors',
  key: BenchmarkKeys.ActiveContributors,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '{value} active contributors in the last quarter',
      text: `Project activity is critically low, indicating significant 
      maintenance and sustainability risks.`,
      points: 0
    },
    {
      pointStart: 2,
      pointEnd: 3,
      type: 'negative',
      description: '{value} active contributors in the last quarter',
      text: `Project has very limited contributor activity, 
      which may impact development pace and maintenance coverage.`,
      points: 1
    },
    {
      pointStart: 4,
      pointEnd: 6,
      type: 'warning',
      description: '{value} active contributors in the last quarter',
      text: `Project maintains basic activity levels with a small contributor base, 
      suggesting limited development capacity.`,
      points: 2
    },
    {
      pointStart: 7,
      pointEnd: 10,
      type: 'warning',
      description: '{value} active contributors in the last quarter',
      text: `Project sustains moderate activity levels, 
      though additional contributors could help ensure consistent maintenance.`,
      points: 3
    },
    {
      pointStart: 11,
      pointEnd: 20,
      type: 'positive',
      description: '{value} active contributors in the last quarter',
      text: `Project maintains consistent activity with a 
      stable contributor base driving regular development.`,
      points: 4
    },
    {
      pointStart: 21,
      pointEnd: null,
      type: 'positive',
      description: '{value} active contributors in the last quarter',
      text: `Project benefits from a large contributor base, ensuring 
      continuous improvement and a vibrant development community`,
      points: 5
    }
  ],
  visibilityCheck: (selectedTimeRangeKey: string) => {
    if (selectedTimeRangeKey === dateOptKeys.previousQuarter) {
      return true;
    }
    return false;
  }
};
