// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { GeoMapData } from '~/components/modules/widget/components/contributors/types/geo-map.types';

// "Unknown" location is intentionally hidden from the list and chart (see IN-1225 / #2062).
export const filterKnownCountries = (data?: GeoMapData[]): GeoMapData[] =>
  data?.filter((item) => item.name !== 'Unknown') ?? [];
