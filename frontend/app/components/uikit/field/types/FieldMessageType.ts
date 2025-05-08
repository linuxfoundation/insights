// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const fieldMessageTypes = [
  'error',
  'warning',
  'hint',
  'info',
] as const;

export type FieldMessageType = typeof fieldMessageTypes[number];
