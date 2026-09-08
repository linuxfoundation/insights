// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import {
  getLifecycleLabelConfig,
  getHealthScoreV2Config,
  isPartialHealthScore,
} from './trust-score';

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

describe('isPartialHealthScore', () => {
  test('should return false when healthMaxScore is null (fewer than 2 categories covered)', () => {
    expect(isPartialHealthScore(null)).toBe(false);
  });

  test('should return false when healthMaxScore is undefined (field omitted by an older response)', () => {
    expect(isPartialHealthScore(undefined)).toBe(false);
  });

  test('should return false when healthMaxScore is 100 (all 3 categories covered)', () => {
    expect(isPartialHealthScore(100)).toBe(false);
  });

  test.each([60, 65, 75])(
    'should return true when healthMaxScore is %i (exactly 1 category missing)',
    (max) => {
      expect(isPartialHealthScore(max)).toBe(true);
    },
  );
});

describe('getHealthScoreV2Config', () => {
  test('should not append a partial suffix by default', () => {
    const result = getHealthScoreV2Config('healthy');
    expect(result.label).toBe('Healthy');
  });

  test('should append " - Partial" to the label when isPartial is true', () => {
    const result = getHealthScoreV2Config('healthy', true);
    expect(result.label).toBe('Healthy - Partial');
  });

  test('should not append a partial suffix when isPartial is false', () => {
    const result = getHealthScoreV2Config('healthy', false);
    expect(result.label).toBe('Healthy');
  });

  test('should append the partial suffix to the unavailable fallback when label is null', () => {
    const result = getHealthScoreV2Config(null, true);
    expect(result.label).toBe('Unavailable - Partial');
  });

  test('should preserve the badge color when appending the partial suffix', () => {
    const withoutPartial = getHealthScoreV2Config('critical');
    const withPartial = getHealthScoreV2Config('critical', true);
    expect(withPartial.ghBadgeColor).toBe(withoutPartial.ghBadgeColor);
  });
});
