// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~~/types/shared/granularity';

export const formatByGranularity = {
  [Granularity.DAILY]: 'MMM d',
  [Granularity.WEEKLY]: 'MMM d',
  [Granularity.MONTHLY]: 'MMM, yyyy',
  [Granularity.QUARTERLY]: 'MMM d',
  [Granularity.YEARLY]: 'yyyy'
};

export const lineGranularities = {
  [dateOptKeys.past90days]: Granularity.DAILY,
  [dateOptKeys.past180days]: Granularity.WEEKLY,
  [dateOptKeys.past365days]: Granularity.MONTHLY,
  [dateOptKeys.previousQuarter]: Granularity.DAILY,
  [dateOptKeys.previousYear]: Granularity.MONTHLY,
  [dateOptKeys.previous5Year]: Granularity.MONTHLY,
  [dateOptKeys.previous10Year]: Granularity.YEARLY,
  [dateOptKeys.alltime]: Granularity.YEARLY,
  [dateOptKeys.custom]: Granularity.YEARLY // TODO: this should be handled differently
};

export const barGranularities = {
  [dateOptKeys.past90days]: Granularity.WEEKLY,
  [dateOptKeys.past180days]: Granularity.WEEKLY,
  [dateOptKeys.past365days]: Granularity.MONTHLY,
  [dateOptKeys.previousQuarter]: Granularity.DAILY,
  [dateOptKeys.previousYear]: Granularity.MONTHLY,
  [dateOptKeys.previous5Year]: Granularity.MONTHLY,
  [dateOptKeys.previous10Year]: Granularity.YEARLY,
  [dateOptKeys.alltime]: Granularity.YEARLY,
  [dateOptKeys.custom]: Granularity.YEARLY // TODO: this should be handled differently
};
