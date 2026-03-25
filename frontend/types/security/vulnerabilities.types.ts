// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface VulnerabilitiesSummary {
  count: number;
  fixedPercentage: number;
  daysSinceLastVuln: number;
  avgCvssScore: number;
  ecosystems: string[];
  lastScanStatus: string;
}

export interface VulnerabilityByEcosystem {
  packageEcosystem: string;
  count: number;
  percentage: number;
}

export interface VulnerabilityBySeverity {
  severity: string;
  count: number;
  percentage: number;
}

export interface VulnerabilityListItem {
  vulnerabilityId: string;
  cveId: string;
  packageName: string;
  severity: string;
  description: string;
  ecosystem: string;
  publishedAt: string;
  status: string;
  paths: string[];
}
