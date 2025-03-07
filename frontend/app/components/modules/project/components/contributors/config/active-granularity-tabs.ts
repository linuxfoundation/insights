import type { GranularityTabs } from '../types/contributors.types';
import { dateOptKeys } from '~/components/modules/project/config/date-options';

export const granularityTabs: GranularityTabs[] = [
  {
    label: 'Weekly',
    value: 'weekly',
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
    value: 'monthly',
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
    value: 'quarterly',
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
    value: 'yearly',
    format: 'yyyy',
    showForKeys: [
      dateOptKeys.previous5Year,
      dateOptKeys.previous10Year,
      dateOptKeys.alltime
    ]
  }
];
