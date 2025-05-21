// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const organizationDependency: BenchmarkConfigs = {
  title: 'Organization Dependency',
  key: BenchmarkKeys.OrganizationDependency,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '{value} organization accounts for 51%+ of contributions',
      text: `This project is highly dependent on a single organization, 
      indicating a lack of diverse organizational support.`,
      points: 0
    },
    {
      pointStart: 2,
      pointEnd: 2,
      type: 'negative',
      description: '{value} organizations account for 51%+ of contributions',
      text: `This project mainly relies on only two organizations, 
      which suggests risk if one withdraws.`,
      points: 1
    },
    {
      pointStart: 3,
      pointEnd: 3,
      type: 'warning',
      description: '{value} organizations account for 51%+ of contributions',
      text: `This project shows modest organizational diversity, 
      with a small number of organizations driving the majority of contributions.`,
      points: 2
    },
    {
      pointStart: 4,
      pointEnd: 5,
      type: 'warning',
      description: '{value} organizations account for 51%+ of contributions',
      text: `This project has a moderate spread of contributions across several organizations.`,
      points: 3
    },
    {
      pointStart: 6,
      pointEnd: 7,
      type: 'positive',
      description: '{value} organizations account for 51%+ of contributions',
      text: `This project benefits from strong organizational diversity, 
      with contributions well-distributed across many organizations.`,
      points: 4
    },
    {
      pointStart: 8,
      pointEnd: null,
      type: 'positive',
      description: '{value} organizations account for 51%+ of contributions',
      text: `This project benefits from excellent organizational diversity, 
      ensuring robust support and resilience through a wide range of contributing organizations.`,
      points: 5
    }
  ],
  visibilityCheck: () => true
};
