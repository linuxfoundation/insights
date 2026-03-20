// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { lfxColors } from '~/config/styles/colors';

export const COUNTRY_COLOR_MAP: Record<string, string> = {
  US: lfxColors.brand[500],
  IN: lfxColors.warning[400],
  CN: lfxColors.negative[400],
  DE: lfxColors.warning[300],
  GB: lfxColors.brand[300],
  CA: lfxColors.negative[300],
  FR: lfxColors.accent[400],
  JP: lfxColors.violet[400],
  BR: lfxColors.positive[400],
  AU: lfxColors.discovery[300],
};

export const getCountryColor = (countryCode: string): string => {
  return COUNTRY_COLOR_MAP[countryCode] || lfxColors.neutral[400];
};
