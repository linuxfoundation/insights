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
      description: '0–1 new pull requests per month',
      text: `This project shows extremely low pull request activity, which may indicate 
      a lack of ongoing development or community engagement.`
    },
    {
      pointStart: 2,
      pointEnd: 3,
      type: 'negative',
      description: '2–3 new pull requests per month',
      text: `This project experiences minimal new pull request activity, suggesting 
      limited development momentum and external contributions.`
    },
    {
      pointStart: 4,
      pointEnd: 7,
      type: 'warning',
      description: '4–7 new pull requests per month',
      text: `This project demonstrates modest development activity, with a small 
      but growing number of contributions being proposed.`
    },
    {
      pointStart: 8,
      pointEnd: 15,
      type: 'warning',
      description: '8–15 new pull requests per month',
      text: `This project sees a moderate volume of new pull requests, reflecting 
      a consistent level of development and community participation.`
    },
    {
      pointStart: 16,
      pointEnd: 30,
      type: 'positive',
      description: '16–30 new pull requests per month',
      text: `This project benefits from strong development activity, with a healthy 
      influx of contributions indicating robust ongoing improvements.`
    },
    {
      pointStart: 31,
      pointEnd: null,
      type: 'positive',
      description: '31 or more new pull requests per month',
      text: `This project exhibits exceptional pull request activity, signaling 
      a vibrant development process and high community involvement.`
    }
  ],
  visibilityCheck: (
    _selectedTimeRangeKey: string,
    _startDate: string,
    _endDate: string,
    additionalCheck?: boolean
  ) => !!additionalCheck
};
