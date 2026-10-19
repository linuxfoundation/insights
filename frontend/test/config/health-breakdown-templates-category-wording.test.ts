// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';

import { getCategoryDescription } from '../../config/health-breakdown-templates';
import type { HealthBreakdownResults } from '../../types/overview/responses.types';

const baseSignals = {
  busFactorCount: 0,
  orgCount: 0,
  medianIssueResponseS: null,
  releaseCadenceAvailable: true,
  daysSinceLatest: 30,
  commitsLast6m: 10,
} as HealthBreakdownResults;

describe('maintainer category text in the lowest band', () => {
  test('says no active maintainer when none was found', () => {
    const result = getCategoryDescription('maintainer', 4, true, baseSignals);
    expect(result).toBe('No active maintainer. There is no succession plan in place.');
  });

  test('names the single maintainer and their low responsiveness', () => {
    const signals = {
      ...baseSignals,
      busFactorCount: 1,
      responsivenessAvailable: true,
      responsivenessScore: 0,
    };
    const result = getCategoryDescription('maintainer', 4, true, signals);
    expect(result).toBe(
      'A single active maintainer, with little or no response to issues and PRs. There is no succession plan in place.',
    );
  });

  test('does not claim low responsiveness when the maintainer responds quickly', () => {
    const signals = {
      ...baseSignals,
      busFactorCount: 1,
      responsivenessAvailable: true,
      responsivenessScore: 12,
    };
    const result = getCategoryDescription('maintainer', 15, true, signals);
    expect(result).toBe('A single active maintainer. There is no succession plan in place.');
  });

  test('does not claim low responsiveness when responsiveness is unavailable', () => {
    const signals = {
      ...baseSignals,
      busFactorCount: 1,
      responsivenessAvailable: false,
      responsivenessScore: null,
    };
    const result = getCategoryDescription('maintainer', 4, true, signals);
    expect(result).toBe('A single active maintainer. There is no succession plan in place.');
  });

  test('counts several maintainers', () => {
    const signals = { ...baseSignals, busFactorCount: 2 };
    const result = getCategoryDescription('maintainer', 4, true, signals);
    expect(result).toContain('Only 2 active maintainers');
    expect(result).not.toContain('No active maintainer');
  });
});

describe('development category text without release data', () => {
  const noReleases = { ...baseSignals, releaseCadenceAvailable: false, daysSinceLatest: 0 };

  test('success band does not report a release 0 days ago', () => {
    const result = getCategoryDescription('development', 20, true, noReleases);
    expect(result).toBe(
      'Active commit stream. No release data is available. Issue triage is keeping pace with incoming reports.',
    );
  });

  test('warning band does not claim the release cadence slowed', () => {
    const result = getCategoryDescription('development', 10, true, noReleases);
    expect(result).toBe(
      'No release data is available. Some commit activity continues, but other development signals are weak.',
    );
  });

  test('lowest band does not claim releases stalled', () => {
    const result = getCategoryDescription('development', 4, true, noReleases);
    expect(result).toBe(
      'Minimal commit activity in the past six months. Issue resolution has stalled, and no release data is available.',
    );
  });

  test('warning band keeps the release wording when release data exists', () => {
    const result = getCategoryDescription('development', 10, true, baseSignals);
    expect(result).toBe(
      'Release cadence has slowed. Some commit activity continues but the project shows signs of stagnation.',
    );
  });
});
