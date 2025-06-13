// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export type CarouselData = Record<string, number | string | boolean | null | undefined>[];

export interface CarouselProps {
  value: CarouselData[];
  circular?: boolean;
}
