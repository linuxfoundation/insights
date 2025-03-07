import { dateOptKeys } from '~/components/modules/project/config/date-options';

export enum Granularity {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly'
}

export const lineGranularities = {
  [dateOptKeys.past90days]: {
    granularity: Granularity.Daily,
    format: 'MMM d'
  },
  [dateOptKeys.past180days]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.past365days]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.previousQuarter]: {
    granularity: Granularity.Daily,
    format: 'MMM d'
  },
  [dateOptKeys.previousYear]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.previous5Year]: {
    granularity: Granularity.Monthly,
    format: 'MMM d'
  },
  [dateOptKeys.previous10Year]: {
    granularity: Granularity.Yearly,
    format: 'yyyy'
  },
  [dateOptKeys.alltime]: {
    granularity: Granularity.Yearly,
    format: 'yyyy'
  },
  [dateOptKeys.custom]: {
    // TODO: this should be handled differently
    granularity: Granularity.Yearly,
    format: 'yyyy'
  }
};

export const barGranularities = {
  [dateOptKeys.past90days]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.past180days]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.past365days]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.previousQuarter]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.previousYear]: {
    granularity: Granularity.Weekly,
    format: 'MMM d'
  },
  [dateOptKeys.previous5Year]: {
    granularity: Granularity.Monthly,
    format: 'MMM yyyy'
  },
  [dateOptKeys.previous10Year]: {
    granularity: Granularity.Yearly,
    format: 'yyyy'
  },
  [dateOptKeys.alltime]: {
    granularity: Granularity.Yearly,
    format: 'yyyy'
  },
  [dateOptKeys.custom]: {
    // TODO: this should be handled differently
    granularity: Granularity.Yearly,
    format: 'yyyy'
  }
};
