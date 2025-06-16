// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const retention: BenchmarkConfigs = {
  title: 'Quarterly Contributor Retention Rate',
  key: BenchmarkKeys.Retention,
  points: [
    {
      pointStart: 0,
      pointEnd: 2,
      type: 'negative',
      description: '{value}% of contributors are contributing quarter over quarter',
      text: `This project has extremely low contributor retention, 
      indicating that nearly all contributors disengage after a single quarter.`,
      points: 0,
    },
    {
      pointStart: 3,
      pointEnd: 5,
      type: 'negative',
      description: '{value}% of contributors are contributing quarter over quarter',
      text: `This project has very low contributor retention, 
      suggesting difficulty in keeping contributors engaged over time.`,
      points: 1,
    },
    {
      pointStart: 6,
      pointEnd: 9,
      type: 'warning',
      description: '{value}% of contributors are contributing quarter over quarter',
      text: `This project has modest contributor retention, 
      with fewer than 10% of contributors returning in subsequent quarters.`,
      points: 2,
    },
    {
      pointStart: 10,
      pointEnd: 14,
      type: 'warning',
      description: '{value}% of contributors are contributing quarter over quarter',
      text: `This project has decent contributor retention, 
      with 10%+ of contributors continuing their involvement.`,
      points: 3,
    },
    {
      pointStart: 15,
      pointEnd: 19,
      type: 'positive',
      description: '{value}% of contributors are contributing quarter over quarter',
      text: `This project has strong contributor retention, 
      reflecting an engaged and consistent contributor base.`,
      points: 4,
    },
    {
      pointStart: 20,
      pointEnd: null,
      type: 'positive',
      description: '{value}% of contributors are contributing quarter over quarter',
      text: `This project has excellent contributor retention, 
      indicating a highly engaged and stable community.`,
      points: 5,
    },
  ],
  visibilityCheck: (
    _selectedTimeRangeKey: string,
    startDate: string,
    endDate: string,
    additionalCheck?: boolean
  ) => {
    const start = DateTime.fromISO(startDate || '');
    const end = DateTime.fromISO(endDate || '');
    // TODO: verify this with Joana and Jonathan
    const isAboveThreshold = Math.ceil(end.diff(start, 'days').days) >= 180;

    return isAboveThreshold && !!additionalCheck;
  },
};
