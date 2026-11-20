// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { DOCS_READINESS_CATEGORIES } from '~~/config/docs-readiness';
import type { DocsReadinessBiggestGap } from '~~/types/docs-readiness/readiness.types';

export function parseCategoryScores(raw: string | undefined): Record<string, number> | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => typeof value === 'number'),
  ) as Record<string, number>;
}

export function categoryPoints(percent: number, weight: number): number {
  return Math.round((percent * weight) / 100);
}

export function findBiggestGap(scores: Record<string, number>): DocsReadinessBiggestGap | null {
  let best: (DocsReadinessBiggestGap & { lost: number }) | null = null;
  for (const { key, name, weight } of DOCS_READINESS_CATEGORIES) {
    if (!(key in scores)) continue;
    const earned = categoryPoints(scores[key]!, weight);
    const lost = weight - earned;
    if (lost > 0 && (!best || lost > best.lost || (lost === best.lost && weight > best.weight))) {
      best = { key, name, earned, weight, lost };
    }
  }
  return best && { key: best.key, name: best.name, earned: best.earned, weight: best.weight };
}
