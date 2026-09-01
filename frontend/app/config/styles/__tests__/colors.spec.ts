// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect } from 'vitest';
import { lfxColors } from '../colors';

describe('lfxColors.health', () => {
  it('gives fair and concerning distinct colors', () => {
    expect(lfxColors.health.fair).not.toBe(lfxColors.health.concerning);
  });

  it('uses the accent color for fair and the warning color for concerning', () => {
    expect(lfxColors.health.fair).toBe(lfxColors.accent[500]);
    expect(lfxColors.health.concerning).toBe(lfxColors.warning[500]);
  });
});
