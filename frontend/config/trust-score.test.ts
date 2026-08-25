// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import { getLifecycleLabelConfig } from './trust-score';

describe('getLifecycleLabelConfig', () => {
  test('should return the inert label and color when lifecycle state is "inert"', () => {
    const result = getLifecycleLabelConfig('inert');
    expect(result).toEqual({
      label: 'Inert',
      color: 'bg-warning-600',
    });
  });

  test('should return Unknown for null or undefined lifecycle state', () => {
    const result1 = getLifecycleLabelConfig(null);
    const result2 = getLifecycleLabelConfig(undefined);
    expect(result1).toEqual({ label: 'Unknown', color: 'bg-neutral-400' });
    expect(result2).toEqual({ label: 'Unknown', color: 'bg-neutral-400' });
  });

  test('should return Unknown for unrecognized lifecycle state', () => {
    const result = getLifecycleLabelConfig('invalid-state');
    expect(result).toEqual({ label: 'Unknown', color: 'bg-neutral-400' });
  });
});
