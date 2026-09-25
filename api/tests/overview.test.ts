// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';
import { describe, expect, it } from 'vitest';

import {
  HealthLabel,
  ImpactLabel,
  LifecycleLabel,
  nullObject,
  OverviewQuery,
} from '../src/lib/overview.js';
import { enumGuard } from '../src/lib/security.js';
import { nullableNumber, nullableString } from '../src/schemas/common.js';

describe('labels (AC2)', () => {
  it.each([
    ['HealthLabel', HealthLabel, ['excellent', 'healthy', 'fair', 'concerning', 'critical']],
    [
      'LifecycleLabel',
      LifecycleLabel,
      ['active', 'stable', 'declining', 'inert', 'abandoned', 'archived'],
    ],
    ['ImpactLabel', ImpactLabel, ['foundational', 'major', 'moderate', 'minor']],
  ])('%s publishes a nullable string enum of the data values', (_, schema, values) => {
    expect(schema).toMatchObject({ type: 'string', nullable: true, enum: [...values, null] });
  });

  it('guards accept each value and null, and reject anything else', () => {
    const isLabel = enumGuard(HealthLabel);
    expect(isLabel('fair')).toBe(true);
    expect(isLabel(null)).toBe(true);
    expect(isLabel('Fair')).toBe(false);
    expect(isLabel(undefined)).toBe(false);
    expect(isLabel('')).toBe(false);
  });
});

describe('nullObject (AC3)', () => {
  it('sets every field of a flat object to null', () => {
    const schema = Type.Object({
      score: nullableNumber('Score.'),
      healthLabel: HealthLabel,
      name: nullableString('Name.'),
    });
    expect(nullObject(schema)).toEqual({ score: null, healthLabel: null, name: null });
  });

  it('recurses into nested objects and keeps their keys', () => {
    const schema = Type.Object({
      maintainerHealth: Type.Object({
        busFactor: Type.Object({ score: nullableNumber('Points.'), count: nullableNumber('N.') }),
        available: nullableNumber('Flag.'),
      }),
      lastCommitAt: nullableString('When.'),
    });
    expect(nullObject(schema)).toEqual({
      maintainerHealth: { busFactor: { score: null, count: null }, available: null },
      lastCommitAt: null,
    });
  });
});

describe('OverviewQuery (AC4)', () => {
  it('takes an optional repos list only', () => {
    expect(Object.keys(OverviewQuery.properties)).toEqual(['repos']);
    expect(OverviewQuery.required ?? []).toEqual([]);
    expect(OverviewQuery.properties.repos).toMatchObject({
      type: 'array',
      items: { type: 'string' },
    });
  });
});
