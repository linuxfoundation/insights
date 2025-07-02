// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Summary } from '~~/types/shared/summary.types';

export type DeltaDisplayProps = {
  summary: Summary;
  isReverse?: boolean;
  flipDisplay?: boolean;
  hidePreviousValue?: boolean;
  percentageOnly?: boolean;
  unit?: string;
  isDuration?: boolean;
  isShort?: boolean;
};
