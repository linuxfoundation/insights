// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const activeContributors: BenchmarkConfigs = {
  title: 'Quaterly Active Contributors',
  key: BenchmarkKeys.ActiveContributors,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '0–1 active contributors in the last quarter',
      text: `This project shows little to no recent activity, 
      indicating a high risk of stagnation or abandonment.`,
      points: 0
    },
    {
      pointStart: 2,
      pointEnd: 3,
      type: 'negative',
      description: '2–3 active contributors in the last quarter',
      text: `This project has minimal recent activity, 
      suggesting limited engagement and a potential for slower development.`,
      points: 1
    },
    {
      pointStart: 4,
      pointEnd: 6,
      type: 'warning',
      description: '4–6 active contributors in the last quarter',
      text: `This project has a modest number of active contributors, 
      reflecting a small but potentially growing community.`,
      points: 2
    },
    {
      pointStart: 7,
      pointEnd: 10,
      type: 'warning',
      description: '7–10 active contributors in the last quarter',
      text: `This project has a moderate level of activity, 
      indicating steady development and maintenance efforts.`,
      points: 3
    },
    {
      pointStart: 11,
      pointEnd: 20,
      type: 'positive',
      description: '11–20 active contributors in the last quarter',
      text: `This project benefits from robust contributor engagement, 
      signaling a healthy and active development cycle.`,
      points: 4
    },
    {
      pointStart: 21,
      pointEnd: null,
      type: 'positive',
      description: '21 or more active contributors in the last quarter',
      text: `This project demonstrates exceptional contributor activity, 
      ensuring continuous improvement and a vibrant development community.`,
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
