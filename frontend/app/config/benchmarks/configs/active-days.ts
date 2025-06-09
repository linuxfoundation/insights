// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const activeDays: BenchmarkConfigs = {
  title: 'Active Days',
  key: BenchmarkKeys.ActiveDays,
  points: [
    {
      pointStart: 0,
      pointEnd: 5,
      type: 'negative',
      description: 'Active on {value} of the last 365 days',
      text: `Project activity occurs on very few days, 
      indicating significant gaps in development continuity.`,
      points: 0
    },
    {
      pointStart: 6,
      pointEnd: 10,
      type: 'negative',
      description: 'Active on {value} of the last 365 days',
      text: `Project shows infrequent activity patterns, 
      with notable gaps between development periods.`,
      points: 1
    },
    {
      pointStart: 11,
      pointEnd: 15,
      type: 'warning',
      description: 'Active on {value} of the last 365 days',
      text: `This project demonstrates modest activity, 
      with contributions occurring on a fair number of days, 
      but still with room for improvement.`,
      points: 2
    },
    {
      pointStart: 16,
      pointEnd: 20,
      type: 'warning',
      description: 'Active on {value} of the last 365 days',
      text: `This project shows moderate activity, 
      with regular contributions that reflect a steady pace of development.`,
      points: 3
    },
    {
      pointStart: 21,
      pointEnd: 26,
      type: 'positive',
      description: 'Active on {value} of the last 365 days',
      text: `This project benefits from strong activity, with contributions on most days, 
      indicating a robust and engaged development process.`,
      points: 4
    },
    {
      pointStart: 27,
      pointEnd: null,
      type: 'positive',
      description: 'Active on {value} of the last 365 days',
      text: `Project demonstrates exceptionally consistent activity, 
      with development occurring multiple times per week.`,
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
