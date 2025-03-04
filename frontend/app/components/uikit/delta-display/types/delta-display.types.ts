import type { IconType } from '../../icon/types/icon.types';
import type { Summary } from '~/components/shared/types/summary.types';

export type DeltaDisplayProps = {
  summary: Summary;
  isReverse?: boolean;
  icon?: string;
  iconType?: IconType;
  flipDisplay?: boolean;
  hidePreviousValue?: boolean;
  percentageOnly?: boolean;
  unit?: string;
  isDuration?: boolean;
};
