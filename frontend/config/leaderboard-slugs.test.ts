// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, test } from 'vitest';

import {
  leaderboardKeyFromSlug,
  leaderboardSlug,
  legacyLeaderboardSlug,
} from './leaderboard-slugs';

describe('leaderboard slugs', () => {
  test('maps the company leaderboards to their URL slugs and back', () => {
    expect(leaderboardSlug('organizations')).toBe('companies');
    expect(leaderboardSlug('active-organizations')).toBe('active-companies');
    expect(leaderboardKeyFromSlug('companies')).toBe('organizations');
    expect(leaderboardKeyFromSlug('active-companies')).toBe('active-organizations');
  });

  test('passes other keys and slugs through unchanged', () => {
    expect(leaderboardSlug('contributors')).toBe('contributors');
    expect(leaderboardKeyFromSlug('contributors')).toBe('contributors');
    expect(leaderboardKeyFromSlug('organizations')).toBe('organizations');
  });

  test('ignores inherited object properties', () => {
    expect(leaderboardKeyFromSlug('constructor')).toBe('constructor');
    expect(leaderboardKeyFromSlug('__proto__')).toBe('__proto__');
    expect(leaderboardSlug('toString')).toBe('toString');
  });

  test('finds the company slug for old leaderboard URL segments in any case', () => {
    expect(legacyLeaderboardSlug('organizations')).toBe('companies');
    expect(legacyLeaderboardSlug('Active-Organizations')).toBe('active-companies');
    expect(legacyLeaderboardSlug('ORGANIZATIONS')).toBe('companies');
    expect(legacyLeaderboardSlug('companies')).toBeUndefined();
    expect(legacyLeaderboardSlug('constructor')).toBeUndefined();
  });
});
