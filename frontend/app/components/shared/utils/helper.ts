// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable */

export const isEmptyData = (value: Record<string, unknown>[] | null | undefined) =>
  // check if the value is null or undefined or the length of the value is 0
  value === null || value === undefined || value.length === 0;

export const isElementVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 0 && rect.bottom <= windowHeight;
};
