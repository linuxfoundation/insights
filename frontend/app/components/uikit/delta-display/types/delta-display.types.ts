import type { Summary } from '~~/types/shared/summary.types';

export type DeltaDisplayProps = {
  summary: Summary;
  isReverse?: boolean;
  flipDisplay?: boolean;
  hidePreviousValue?: boolean;
  percentageOnly?: boolean;
  unit?: string;
  isDuration?: boolean;
};
