// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import { getOpenVulnRow } from '../../config/health-breakdown-templates';
import type { HealthBreakdownResults } from '../../types/overview/responses.types';

describe('getOpenVulnRow UNKNOWN-severity open vulnerabilities', () => {
  const defaultSignals: HealthBreakdownResults = {
    busFactorScore: null,
    busFactorAvailable: false,
    busFactorCount: null,
    orgDiversityScore: null,
    orgDiversityAvailable: false,
    orgCount: null,
    responsivenessScore: null,
    responsivenessAvailable: false,
    medianPrResponseS: null,
    medianIssueResponseS: null,
    isGerrit: false,
    isExcluded: false,

    openVulnScore: null,
    openVulnAvailable: false,
    openCriticals: null,
    openHighs: null,
    openModerates: null,
    openUnknowns: null,
    scorecardScorePts: null,
    scorecardAvailable: false,
    scorecardScore: null,
    securityPracticesScore: null,
    securityPracticesAvailable: false,
    securityPolicyEnabled: null,
    branchProtectionEnabled: null,
    branchProtectionRequiredReviews: null,
    branchProtectionRequiresStatusChecks: null,
    branchProtectionAllowsForcePush: null,
    dependencyHealthScore: null,
    dependencyHealthAvailable: false,
    vulnerableDeps: null,

    releaseCadenceScore: null,
    releaseCadenceAvailable: false,
    daysSinceLatest: null,
    daysBetweenRecent: null,
    commitActivityScore: null,
    commitsLast6m: null,
    lastCommitAt: null,
    issueResolutionScore: null,
    issueResolutionAvailable: false,
    closed12m: null,
    opened12m: null,
    medianCloseS: null,
    prMergeScore: null,
    prMergeAvailable: false,
    merged12m: null,
    closedUnmerged12m: null,
    medianMergeS: null,
  };

  test('reports "warning", not "positive", when only UNKNOWN-severity open vulnerabilities exist', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      openVulnAvailable: true,
      openVulnScore: 10,
      openCriticals: 0,
      openHighs: 0,
      openModerates: 0,
      openUnknowns: 16,
    };

    const result = getOpenVulnRow(signals);

    expect(result.status).toBe('warning');
  });

  test('reports "negative" when there are open critical or high severity vulnerabilities', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      openVulnAvailable: true,
      openVulnScore: 2,
      openCriticals: 1,
      openHighs: 2,
      openModerates: 5,
      openUnknowns: 5,
    };

    const result = getOpenVulnRow(signals);

    expect(result.status).toBe('negative');
    expect(result.description).toBe('3 open critical or high vulnerabilities.');
  });

  test('reports "warning" for open moderate-severity vulnerabilities when no criticals or highs are open', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      openVulnAvailable: true,
      openVulnScore: 6,
      openCriticals: 0,
      openHighs: 0,
      openModerates: 4,
      openUnknowns: 0,
    };

    const result = getOpenVulnRow(signals);

    expect(result.status).toBe('warning');
    expect(result.description).toBe(
      '4 open medium/low severity vulnerabilities, no critical or high.',
    );
  });

  test('reports "positive" when all open vulnerability severity counts are zero', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      openVulnAvailable: true,
      openVulnScore: 10,
      openCriticals: 0,
      openHighs: 0,
      openModerates: 0,
      openUnknowns: 0,
    };

    const result = getOpenVulnRow(signals);

    expect(result.status).toBe('positive');
    expect(result.description).toBe('No open vulnerabilities of any severity.');
  });

  test('treats a null severity count as 0/absent rather than as a positive signal', () => {
    const signals: HealthBreakdownResults = {
      ...defaultSignals,
      openVulnAvailable: true,
      openVulnScore: 10,
      openCriticals: 0,
      openHighs: 0,
      openModerates: 0,
      openUnknowns: null,
    };

    const result = getOpenVulnRow(signals);

    expect(result.status).toBe('positive');
    expect(result.description).toBe('No open vulnerabilities of any severity.');
  });
});
