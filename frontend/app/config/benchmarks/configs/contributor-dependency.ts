// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';

export const contributorDependency: BenchmarkConfigs = {
  title: 'Contributor Dependency',
  key: BenchmarkKeys.ContributorDependency,
  points: [
    {
      pointStart: 0,
      pointEnd: 1,
      type: 'negative',
      description: '{value} contributor accounts for 51%+ of contributions',
      text: `This project is highly dependent on a single contributor, 
        indicating an increased risk if that individual becomes unavailable.`,
      points: 0
    },
    {
      pointStart: 2,
      pointEnd: 2,
      type: 'negative',
      description: '{value} contributors account for 51%+ of contributions',
      text: `This project relies on only two contributors, suggesting limited participation 
        and vulnerability to disruptions if one contributor withdraws.`,
      points: 1
    },
    {
      pointStart: 3,
      pointEnd: 4,
      type: 'warning',
      description: '{value} contributors account for 51%+ of contributions',
      text: `This project shows modest contributor diversity, with a small group 
        driving the majority of contributions.`,
      points: 2
    },
    {
      pointStart: 5,
      pointEnd: 6,
      type: 'warning',
      description: '{value} contributors account for 51%+ of contributions',
      text: `This project has a moderate spread of contributions across several contributors, 
        indicating an improved level of resilience.`,
      points: 3
    },
    {
      pointStart: 7,
      pointEnd: 9,
      type: 'positive',
      description: '{value} contributors account for 51%+ of contributions',
      text: `This project benefits from strong contributor diversity, with responsibilities 
        well-distributed among a broader group of individuals.`,
      points: 4
    },
    {
      pointStart: 10,
      pointEnd: null,
      type: 'positive',
      description: '{value} contributors account for 51%+ of contributions',
      text: `This project exhibits excellent contributor diversity, ensuring robust 
        support and a highly resilient development process.`,
      points: 5
    }
  ],
  visibilityCheck: () => true
};
