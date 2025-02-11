import type { IconType } from '../../icon/types/icon.types';

export type DeltaDisplayProps = {
  current: number;
  previous: number;
  isReverse?: boolean;
  icon?: string;
  iconType?: IconType;
};
