// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Health Score v2 signal catalogue (11 signals across 3 categories), sourced from
// `health_score_v2_signal_detail_ds`. Shared by widgets 03, 05 and 06 (IN-1288, IN-1290, IN-1291).
// Category/max-pts breakdown mirrors the Tinybird pipes (see health_score_report_signal_scores.pipe
// and health_score_report_signal_availability.pipe): Maintainer health (40), Security & supply chain
// (35), Development activity (25).
export const healthScoreSignals = [
  {
    key: 'bus_factor',
    label: 'Bus factor',
    category: 'maintainer-health',
    maxPts: 18,
    scoreColumn: 'busFactorScore',
    flagColumn: 'busFactorAvailable',
  },
  {
    key: 'org_diversity',
    label: 'Organizational diversity',
    category: 'maintainer-health',
    maxPts: 7,
    scoreColumn: 'orgDiversityScore',
    flagColumn: 'orgDiversityAvailable',
  },
  {
    key: 'responsiveness',
    label: 'Responsiveness',
    category: 'maintainer-health',
    maxPts: 15,
    scoreColumn: 'responsivenessScore',
    flagColumn: 'responsivenessAvailable',
  },
  {
    key: 'open_vuln',
    label: 'Known vulnerabilities',
    category: 'security-supply-chain',
    maxPts: 10,
    scoreColumn: 'openVulnScore',
    flagColumn: 'openVulnAvailable',
  },
  {
    key: 'scorecard',
    label: 'OpenSSF Scorecard',
    category: 'security-supply-chain',
    maxPts: 7,
    scoreColumn: 'scorecardScorePts',
    flagColumn: 'scorecardAvailable',
  },
  {
    key: 'security_practices',
    label: 'Security practices',
    category: 'security-supply-chain',
    maxPts: 7,
    scoreColumn: 'securityPracticesScore',
    flagColumn: 'securityPracticesAvailable',
  },
  {
    key: 'dependency_health',
    label: 'Dependency health',
    category: 'security-supply-chain',
    maxPts: 5,
    scoreColumn: 'dependencyHealthScore',
    flagColumn: 'dependencyHealthAvailable',
  },
  {
    key: 'release_cadence',
    label: 'Release cadence',
    category: 'development-activity',
    maxPts: 8,
    scoreColumn: 'releaseCadenceScore',
    flagColumn: 'releaseCadenceAvailable',
  },
  {
    key: 'commit_activity',
    label: 'Commit activity',
    category: 'development-activity',
    maxPts: 5,
    scoreColumn: 'commitActivityScore',
    // No availability flag: commitActivityScore always contributes via the lastCommitAt fallback.
    flagColumn: null,
  },
  {
    key: 'issue_resolution',
    label: 'Issue resolution',
    category: 'development-activity',
    maxPts: 7,
    scoreColumn: 'issueResolutionScore',
    flagColumn: 'issueResolutionAvailable',
  },
  {
    key: 'pr_merge',
    label: 'Pull request merge',
    category: 'development-activity',
    maxPts: 5,
    scoreColumn: 'prMergeScore',
    flagColumn: 'prMergeAvailable',
  },
] as const;

export type HealthScoreSignal = (typeof healthScoreSignals)[number];
export type HealthScoreSignalKey = HealthScoreSignal['key'];
