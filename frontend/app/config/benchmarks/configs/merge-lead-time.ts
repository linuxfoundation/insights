// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const mergeLeadTime: BenchmarkConfigs = {
  title: 'Merge Lead Time',
  key: BenchmarkKeys.MergeLeadTime,
  points: [
    {
      pointStart: 30,
      pointEnd: null,
      type: 'negative',
      description: '{value} days',
      text: `This project has extremely slow pull request merging, indicating 
      significant delays in review and integration processes.`,
      points: 0
    },
    {
      pointStart: 21,
      pointEnd: 30,
      type: 'negative',
      description: '{value} days',
      text: `This project shows a very slow merge process, suggesting challenges 
      in timely reviewing and merging of contributions.`,
      points: 1
    },
    {
      pointStart: 15,
      pointEnd: 20,
      type: 'warning',
      description: '{value} days',
      text: `This project demonstrates a modest merge lead time, with noticeable 
      delays that could impede development velocity.`,
      points: 2
    },
    {
      pointStart: 7,
      pointEnd: 14,
      type: 'warning',
      description: '{value} days',
      text: `This project exhibits a reasonable merge lead time, reflecting a 
      balanced and consistent review process.`,
      points: 3
    },
    {
      pointStart: 3,
      pointEnd: 6,
      type: 'positive',
      description: '{value} days',
      text: `This project benefits from fast merging of pull requests, indicating 
      an efficient and responsive review workflow.`,
      points: 4
    },
    {
      pointStart: 0,
      pointEnd: 2,
      type: 'positive',
      description: '{value} days',
      text: `This project showcases exceptional agility, with pull requests being 
      reviewed, accepted, and merged almost immediately, reflecting a highly efficient development process.`,
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

    if (diffInDays > 30) {
      return true;
    }
    return false;
  }
};
