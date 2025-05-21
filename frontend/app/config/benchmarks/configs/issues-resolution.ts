// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const issuesResolution: BenchmarkConfigs = {
  title: 'Issue Resolution Time',
  key: BenchmarkKeys.IssuesResolution,
  points: [
    {
      pointStart: 61,
      pointEnd: null,
      type: 'negative',
      description: 'Average issue resolution time is over {value} days',
      text: `This project has a slow issue resolution, 
      indicating potential challenges in overall responsiveness.`,
      points: 0
    },
    {
      pointStart: 51,
      pointEnd: 60,
      type: 'negative',
      description: 'Average issue resolution time is {value} days',
      text: `This project takes a long time to resolve issues, 
      suggesting a lag in responsiveness and possible maintenance delays.`,
      points: 1
    },
    {
      pointStart: 36,
      pointEnd: 50,
      type: 'warning',
      description: 'Average issue resolution time is {value} days',
      text: `This project shows modest responsiveness, 
      though there is room for improvement in handling issues more efficiently.`,
      points: 2
    },
    {
      pointStart: 22,
      pointEnd: 35,
      type: 'warning',
      description: 'Average issue resolution time is {value} days',
      text: `This project demonstrates reasonable issue resolution times, 
      reflecting a balanced approach to maintenance and responsiveness.`,
      points: 3
    },
    {
      pointStart: 8,
      pointEnd: 21,
      type: 'positive',
      description: 'Average issue resolution time is {value} days',
      text: `This project benefits from fast issue resolution, 
      indicating effective maintenance and a proactive approach to addressing problems.`,
      points: 4
    },
    {
      pointStart: 0,
      pointEnd: 7,
      type: 'positive',
      description: 'Average issue resolution time is {value} days',
      text: `This project benefits from exceptional issue resolution, 
      ensuring issues are resolved promptly and maintaining a high quality standard.`,
      points: 5
    }
  ],
  visibilityCheck: (
    _selectedTimeRangeKey: string,
    startDate: string,
    endDate: string,
    additionalCheck?: boolean
  ) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    const diffInDays = Math.ceil(end.diff(start, 'days').days);

    if (additionalCheck && diffInDays > 60) {
      return true;
    }
    return false;
  }
};
