// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const pullRequests: BenchmarkConfigs = {
  title: 'New Pull Requests per Month',
  key: BenchmarkKeys.PullRequests,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '{value} new pull requests per month',
      text: `This project has extremely low pull request activity, 
      which may indicate a lack of ongoing development or community engagement.`,
      points: 0
    },
    {
      pointStart: 2,
      pointEnd: 3,
      type: 'negative',
      description: '{value} new pull requests per month',
      text: `This project has very low pull request activity, 
      suggesting limited development momentum and external contributions.`,
      points: 1
    },
    {
      pointStart: 4,
      pointEnd: 7,
      type: 'warning',
      description: '{value} new pull requests per month',
      text: `This project has low pull request activity, 
      with a small number of contributions being proposed.`,
      points: 2
    },
    {
      pointStart: 8,
      pointEnd: 15,
      type: 'warning',
      description: '{value} new pull requests per month',
      text: `This project has modest pull request activity.`,
      points: 3
    },
    {
      pointStart: 16,
      pointEnd: 30,
      type: 'positive',
      description: '{value} new pull requests per month',
      text: `This project has strong pull request activity, 
      with a healthy influx of contributions indicating robust ongoing improvements.`,
      points: 4
    },
    {
      pointStart: 31,
      pointEnd: null,
      type: 'positive',
      description: '{value} new pull requests per month',
      text: `This project has excellent pull request activity, 
      signaling a vibrant development process and high community involvement.`,
      points: 5
    }
  ],
  visibilityCheck: (
    _selectedTimeRangeKey: string,
    _startDate: string,
    _endDate: string,
    additionalCheck?: boolean
  ) => !!additionalCheck
};
