// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type TSchema } from '@sinclair/typebox';

import { field } from './geo-distribution.js';

// Values are exposed as the data holds them, matching the Security tab.
const dataEnum = <T extends string>(values: readonly T[], description: string) =>
  Type.Unsafe<T>({ type: 'string', enum: [...values], description });

export const Severity = dataEnum(
  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'] as const,
  'Severity of the vulnerability. `UNKNOWN` when the advisory gives no score.',
);

export const VulnerabilityStatus = dataEnum(
  ['OPEN', 'FIX_AVAILABLE', 'RESOLVED'] as const,
  '`OPEN` has no fixed version, `FIX_AVAILABLE` has a fixed version the project has not adopted, and `RESOLVED` is fixed in the project.',
);

export const ControlResult = dataEnum(
  ['Passed', 'Failed', 'Needs Review', 'Unknown'] as const,
  'Outcome of the control evaluation.',
);

// The serializer ignores enum, so an off-enum value must fail the row guard to reach fetchPipe's 503.
export const enumGuard = (schema: TSchema) => {
  const allowed = new Set<unknown>(schema.enum);
  return (value: unknown) => allowed.has(value);
};

type BreakdownRow<C extends string> = Record<C, string> & { count: number; percentage: number };

// The by-severity and by-ecosystem pipes return the same row under a different key column.
export function breakdown<K extends string, C extends string, S extends TSchema>(
  key: K,
  column: C,
  keySchema: S,
) {
  const inEnum = Array.isArray(keySchema.enum) ? enumGuard(keySchema) : () => true;

  const isRow = (row: BreakdownRow<C>) =>
    typeof row === 'object' &&
    row !== null &&
    !Array.isArray(row) &&
    typeof row[column] === 'string' &&
    inEnum(row[column]) &&
    Number.isSafeInteger(row.count) &&
    row.count >= 0 &&
    Number.isFinite(row.percentage);

  const toItem = (row: BreakdownRow<C>) => ({
    ...field(key, row[column]),
    count: row.count,
    percentage: row.percentage,
  });

  const Item = Type.Object({
    ...field(key, keySchema),
    count: Type.Integer({ description: 'Unresolved vulnerabilities in this group (count).' }),
    percentage: Type.Number({
      description:
        'Share of all unresolved vulnerabilities in this group, rounded to a whole percent, so shares may not add up to 100.',
    }),
  });

  return { isRow, toItem, Item };
}
