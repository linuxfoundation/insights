// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import {
  getOrgDiversityRow,
  getCategoryDescription,
} from '../../config/health-breakdown-templates';
import type { HealthBreakdownResults } from '../../types/overview/responses.types';

describe('Organization Diversity label capitalization IN-1238', () => {
  const defaultSignals: HealthBreakdownResults = {
    responsivenessAvailable: false,
    busFactorAvailable: false,
    orgDiversityAvailable: false,
    scorecardAvailable: false,
    securityPracticesAvailable: false,
    dependencyHealthAvailable: false,
    releaseCadenceAvailable: false,
    issueResolutionAvailable: false,
    prMergeAvailable: false,
    isGerrit: false,
    isExcluded: false,
  };

  test('getOrgDiversityRow outputs full word "organization diversity"', () => {
    const result = getOrgDiversityRow(defaultSignals);
    expect(result.status).toBe('no-data');
    expect(result.description).toContain('organization diversity');
  });

  test('getCategoryDescription includes "organization diversity" in signal list', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      responsivenessAvailable: true,
      busFactorAvailable: true,
      orgDiversityAvailable: true,
    };
    const result = getCategoryDescription('maintainer', null, false, signals);
    expect(result).toContain('maintainer responsiveness');
    expect(result).toContain('bus factor');
    expect(result).toContain('organization diversity');
  });

  test('getCategoryDescription with only org diversity uses full word', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      orgDiversityAvailable: true,
    };
    const result = getCategoryDescription('maintainer', null, false, signals);
    expect(result).toContain('organization diversity');
  });
});
