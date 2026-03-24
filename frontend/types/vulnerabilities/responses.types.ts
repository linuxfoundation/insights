// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low';
export type VulnerabilityStatus = 'open' | 'fixed';

export interface VulnerabilitySummary {
  openVulnerabilities: number;
  medianCvss: number;
  fixedCount: number;
  totalCount: number;
  fixedPercentage: number;
  daysSinceLastVulnerability: number;
}

export interface VulnerabilitySeverityCount {
  severity: VulnerabilitySeverity;
  count: number;
  percentage: number;
}

export interface VulnerabilityEcosystemCount {
  ecosystem: string;
  count: number;
}

export interface Vulnerability {
  cveId: string;
  severity: VulnerabilitySeverity;
  description: string;
  ecosystem: string;
  publishedDate: string;
  status: VulnerabilityStatus;
}

export interface VulnerabilitiesData {
  summary: VulnerabilitySummary;
  severityCounts: VulnerabilitySeverityCount[];
  ecosystemCounts: VulnerabilityEcosystemCount[];
  recentVulnerabilities: Vulnerability[];
}
