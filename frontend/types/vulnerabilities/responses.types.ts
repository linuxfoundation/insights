// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export enum VulnerabilitySeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNKNOWN = 'UNKNOWN',
}

export enum VulnerabilityStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  FIX_AVAILABLE = 'FIX_AVAILABLE',
}

export interface SeverityConfig {
  value: VulnerabilitySeverity;
  label: string;
  bgClass: string;
  dotClass: string;
}

export interface StatusConfig {
  value: VulnerabilityStatus;
  label: string;
  icon: string;
  iconClass: string;
  iconType: 'solid' | 'light';
}

export const SEVERITY_CONFIG: Record<VulnerabilitySeverity, SeverityConfig> = {
  [VulnerabilitySeverity.CRITICAL]: {
    value: VulnerabilitySeverity.CRITICAL,
    label: 'Critical',
    bgClass: 'bg-negative-900 text-white',
    dotClass: 'bg-negative-900',
  },
  [VulnerabilitySeverity.HIGH]: {
    value: VulnerabilitySeverity.HIGH,
    label: 'High',
    bgClass: 'bg-negative-500 text-white',
    dotClass: 'bg-negative-500',
  },
  [VulnerabilitySeverity.MEDIUM]: {
    value: VulnerabilitySeverity.MEDIUM,
    label: 'Medium',
    bgClass: 'bg-warning-500 text-white',
    dotClass: 'bg-warning-500',
  },
  [VulnerabilitySeverity.LOW]: {
    value: VulnerabilitySeverity.LOW,
    label: 'Low',
    bgClass: 'bg-accent-500 text-white',
    dotClass: 'bg-accent-500',
  },
  [VulnerabilitySeverity.UNKNOWN]: {
    value: VulnerabilitySeverity.UNKNOWN,
    label: 'Unknown',
    bgClass: 'bg-neutral-100 text-neutral-600',
    dotClass: 'bg-transparent border border-neutral-500',
  },
};

export const STATUS_CONFIG: Record<VulnerabilityStatus, StatusConfig> = {
  [VulnerabilityStatus.OPEN]: {
    value: VulnerabilityStatus.OPEN,
    label: 'Open',
    icon: 'circle-dashed',
    iconClass: '!text-accent-500',
    iconType: 'solid',
  },
  [VulnerabilityStatus.RESOLVED]: {
    value: VulnerabilityStatus.RESOLVED,
    label: 'Fixed',
    icon: 'circle-check',
    iconClass: '!text-positive-500',
    iconType: 'solid',
  },
  [VulnerabilityStatus.FIX_AVAILABLE]: {
    value: VulnerabilityStatus.FIX_AVAILABLE,
    label: 'Fixable',
    icon: 'wrench',
    iconClass: '!text-warning-600',
    iconType: 'light',
  },
};

export const SEVERITY_OPTIONS = Object.values(SEVERITY_CONFIG);
export const STATUS_OPTIONS = Object.values(STATUS_CONFIG);

export interface VulnerabilitySummary {
  count: number;
  fixedPercentage: number;
  daysSinceLastVuln: number;
  avgCvssScore: number;
  ecosystems: string[];
  lastScanStatus: string;
}

export interface VulnerabilitySeverityCount {
  severity: string;
  count: number;
  percentage: number;
}

export interface VulnerabilityEcosystemCount {
  packageEcosystem: string;
  count: number;
  percentage: number;
}

export interface Vulnerability {
  vulnerabilityId: string;
  cveId: string;
  packageName: string;
  severity: VulnerabilitySeverity;
  description: string;
  ecosystem: string;
  publishedAt: string;
  status: VulnerabilityStatus;
  paths: string[];
  fixedVersion: string;
}
