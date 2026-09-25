// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type TObject } from '@sinclair/typebox';

import { nullableEnum } from '../schemas/common.js';

// Values are exposed as the data holds them, matching the Overview tab.
export const HealthLabel = nullableEnum(
  ['excellent', 'healthy', 'fair', 'concerning', 'critical'] as const,
  'Band of the health score. Null when the score is null.',
);

export const LifecycleLabel = nullableEnum(
  ['active', 'stable', 'declining', 'inert', 'abandoned', 'archived'] as const,
  'Activity state of the project or selected repositories. Null when unknown.',
);

export const ImpactLabel = nullableEnum(
  ['foundational', 'major', 'moderate', 'minor'] as const,
  'Band of the impact score. Null when the score is null.',
);

export const OverviewQuery = Type.Object({
  repos: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'Repository URLs to filter by. Each must match a repository URL of the project exactly; URLs of other projects are ignored.',
    }),
  ),
});

type NullDeep<T extends TObject> = {
  [K in keyof T['properties']]: T['properties'][K] extends TObject
    ? NullDeep<T['properties'][K]>
    : null;
};

// Answers an unknown project or an empty repo-filtered breakdown with every field explicitly null.
export function nullObject<T extends TObject>(schema: T): NullDeep<T> {
  const result: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema.properties)) {
    result[key] = 'properties' in field ? nullObject(field as TObject) : null;
  }
  return result as NullDeep<T>;
}
