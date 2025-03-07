import type { GranularityTabs } from '../types/contributors.types';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~/components/shared/types/granularity';

export const granularityTabs: GranularityTabs[] = [
  {
    label: 'Weekly',
    value: Granularity.Weekly,
    format: 'MMM d, yyyy',
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
    value: Granularity.Monthly,
    format: 'MMM yyyy',
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
    value: Granularity.Quarterly,
    format: 'MMM yyyy',
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
    value: Granularity.Yearly,
    format: 'yyyy',
    showForKeys: [
      dateOptKeys.previous5Year,
      dateOptKeys.previous10Year,
      dateOptKeys.alltime
    ]
  }
];
