// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';
import { describe, expect, it } from 'vitest';

import { breakdown, ControlResult, Severity, VulnerabilityStatus } from '../src/lib/security.js';

describe('enums (AC4)', () => {
  it.each([
    ['Severity', Severity, ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']],
    ['VulnerabilityStatus', VulnerabilityStatus, ['OPEN', 'FIX_AVAILABLE', 'RESOLVED']],
    ['ControlResult', ControlResult, ['Passed', 'Failed', 'Needs Review', 'Unknown']],
  ])('%s publishes a plain string enum of the data values', (_, schema, values) => {
    expect(schema).toMatchObject({ type: 'string', enum: values });
  });
});

describe('breakdown (AC5)', () => {
  const { isRow, toItem, Item } = breakdown('ecosystem', 'packageEcosystem', Type.String());
  const row = { packageEcosystem: 'npm', count: 12, percentage: 60 };

  it('accepts a well-formed row', () => {
    expect(isRow(row)).toBe(true);
  });

  it.each([
    ['an array', []],
    ['null', null],
    ['a missing key column', { count: 12, percentage: 60 }],
    ['a non-string key', { ...row, packageEcosystem: 3 }],
    ['a negative count', { ...row, count: -1 }],
    ['a fractional count', { ...row, count: 1.5 }],
    ['a string count', { ...row, count: '12' }],
    ['a missing percentage', { packageEcosystem: 'npm', count: 12 }],
    ['a non-finite percentage', { ...row, percentage: Number.NaN }],
    ['a negative percentage', { ...row, percentage: -1 }],
    ['a percentage above 100', { ...row, percentage: 101 }],
  ])('rejects %s', (_, bad) => {
    expect(isRow(bad as never)).toBe(false);
  });

  it('renames the key column and keeps count and percentage', () => {
    expect(toItem(row)).toEqual({ ecosystem: 'npm', count: 12, percentage: 60 });
  });

  it('requires every field of the item', () => {
    expect(Item.required?.sort()).toEqual(['count', 'ecosystem', 'percentage']);
  });
});

describe('breakdown with an enum key (AC5)', () => {
  const { isRow } = breakdown('severity', 'severity', Severity);

  it('accepts a key inside the enum and rejects one outside it', () => {
    expect(isRow({ severity: 'HIGH', count: 1, percentage: 10 })).toBe(true);
    expect(isRow({ severity: 'SEVERE', count: 1, percentage: 10 })).toBe(false);
  });
});
