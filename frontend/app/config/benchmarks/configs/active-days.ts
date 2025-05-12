// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const activeDays: BenchmarkConfigs = {
  title: 'Active Days Benchmarks',
  key: BenchmarkKeys.ActiveDays,
  points: [
    {
      pointStart: 0,
      pointEnd: 5,
      type: 'negative',
      description: 'Active on 0–5 of the last 30 days',
      text: `This project shows extremely low activity, with contributions on only a few days, 
      which may indicate stagnation or low engagement.`,
      points: 0
    },
    {
      pointStart: 6,
      pointEnd: 10,
      type: 'negative',
      description: 'Active on 6–10 of the last 30 days',
      text: `This project has minimal activity, suggesting sporadic contributions 
      and inconsistent engagement.`,
      points: 1
    },
    {
      pointStart: 11,
      pointEnd: 15,
      type: 'warning',
      description: 'Active on 11–15 of the last 30 days',
      text: `This project demonstrates modest activity, with contributions occurring on a fair number of days, 
      but still with room for improvement.`,
      points: 2
    },
    {
      pointStart: 16,
      pointEnd: 20,
      type: 'warning',
      description: 'Active on 16–20 of the last 30 days',
      text: `This project shows moderate activity, with regular contributions 
      that reflect a steady pace of development.`,
      points: 3
    },
    {
      pointStart: 21,
      pointEnd: 26,
      type: 'positive',
      description: 'Active on 21–26 of the last 30 days',
      text: `This project benefits from strong activity, with contributions on most days, 
      indicating a robust and engaged development process.`,
      points: 4
    },
    {
      pointStart: 27,
      pointEnd: null,
      type: 'positive',
      description: 'Active on 27–30 of the last 30 days',
      text: `This project exhibits exceptional consistency in activity, with contributions nearly every day, 
      reflecting a highly dynamic and continuously evolving project.`,
      points: 5
    }
  ],
  visibilityCheck: (
    _selectedTimeRangeKey: string,
    startDate: string,
    endDate: string
  ) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    const diffInDays = Math.ceil(end.diff(start, 'days').days);

    if (diffInDays === 30) {
      return true;
    }
    return false;
  }
};
