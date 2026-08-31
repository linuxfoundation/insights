// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import { getOpenVulnRow } from '../../config/health-breakdown-templates';
import type { HealthBreakdownResults } from '../../types/overview/responses.types';

describe('getOpenVulnRow UNKNOWN-severity open vulnerabilities IN-1255', () => {
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

  test('reports "positive" (clean) even though 16 UNKNOWN-severity OPEN vulnerabilities exist', () => {
    // openclaw production data (IN-1255): all known-severity open counts are 0 and
    // openVulnScore is a perfect 10, but there are 16 OPEN vulnerabilities of UNKNOWN
    // severity that none of openCriticals/openHighs/openModerates track.
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

    // Bug: getOpenVulnRow has no visibility into UNKNOWN-severity open vulns, so it
    // falls through to the openVulnScore >= 10 branch and reports a false "clean" ('positive')
    // status instead of the 'warning' status warranted by the 16 untracked open vulnerabilities.
    // This assertion fails against current code (actual status is 'positive') and is expected
    // to pass once an `openUnknowns` field is added and threaded into this function.
    expect(result.status).toBe('warning');
  });
});
