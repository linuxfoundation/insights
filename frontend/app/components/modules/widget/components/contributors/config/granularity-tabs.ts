// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { GranularityTabs } from '../types/contributors.types';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~~/types/shared/granularity';

export const granularityTabs: GranularityTabs[] = [
  {
    label: 'Daily',
    value: Granularity.DAILY,
    format: 'MMM d',
    showForKeys: [dateOptKeys.custom]
  },
  {
    label: 'Weekly',
    value: Granularity.WEEKLY,
    format: 'MMM d',
    showForKeys: [
      dateOptKeys.past90days,
      dateOptKeys.past180days,
      dateOptKeys.past365days,
      dateOptKeys.previousQuarter,
      dateOptKeys.previousYear
    ]
  },
  {
    label: 'Monthly',
    value: Granularity.MONTHLY,
    format: 'MMM, yyyy',
    showForKeys: [
      dateOptKeys.past90days,
      dateOptKeys.past180days,
      dateOptKeys.past365days,
      dateOptKeys.previousQuarter,
      dateOptKeys.previousYear,
      dateOptKeys.previous5Year,

      dateOptKeys.previous10Year
    ]
  },
  {
    label: 'Quarterly',
    value: Granularity.QUARTERLY,
    format: 'MMM d',
    showForKeys: [
      dateOptKeys.past180days,
      dateOptKeys.past365days,
      dateOptKeys.previousYear,
      dateOptKeys.previous5Year,
      dateOptKeys.previous10Year,
      dateOptKeys.alltime
    ]
  },
  {
    label: 'Yearly',
    value: Granularity.YEARLY,
    format: 'yyyy',
    showForKeys: [
      dateOptKeys.previous5Year,
      dateOptKeys.previous10Year,
      dateOptKeys.alltime
    ]
  }
];
