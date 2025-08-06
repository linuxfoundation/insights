// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { isArray } from "lodash-es";

export const isEmptyData = (value: Record<string, unknown>[] | null | undefined) => {
  // check if the value is null or undefined or the length of the value is 0
  if (value === null || value === undefined || value.length === 0 || !isArray(value)) {
    return true;
  }
  
  // Check if all values in the chart data are 0
  return value.every((dataPoint) => {
    const values = dataPoint.values as number[];
    if (!values) {
      return false;
    }
    return (values[0] || 0) === 0 && (values[1] || 0) === 0;
  });
};

export const isElementVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 0 && rect.bottom <= windowHeight;
};
