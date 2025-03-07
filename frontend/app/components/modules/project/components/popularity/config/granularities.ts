import { dateOptKeys } from '../../../config/date-options';
import { Granularity } from '~/components/shared/types/granularity';

export const cumulativeGranularities = {
  [dateOptKeys.past90days]: Granularity.Daily,
  [dateOptKeys.past180days]: Granularity.Weekly,
  [dateOptKeys.past365days]: Granularity.Weekly,
  [dateOptKeys.previousQuarter]: Granularity.Daily,
  [dateOptKeys.previousYear]: Granularity.Weekly,
  [dateOptKeys.previous5Year]: Granularity.Monthly,
  [dateOptKeys.previous10Year]: Granularity.Yearly,
  [dateOptKeys.alltime]: Granularity.Yearly,
  [dateOptKeys.custom]: Granularity.Yearly // TODO: this should be handled differently
};

export const newGranularities = {
  [dateOptKeys.past90days]: Granularity.Weekly,
  [dateOptKeys.past180days]: Granularity.Weekly,
  [dateOptKeys.past365days]: Granularity.Weekly,
  [dateOptKeys.previousQuarter]: Granularity.Weekly,
  [dateOptKeys.previousYear]: Granularity.Weekly,
  [dateOptKeys.previous5Year]: Granularity.Monthly,
  [dateOptKeys.previous10Year]: Granularity.Yearly,
  [dateOptKeys.alltime]: Granularity.Yearly,
  [dateOptKeys.custom]: Granularity.Yearly // TODO: this should be handled differently
};
