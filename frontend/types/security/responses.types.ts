// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 These are the types for the responses the frontend expects from the API for the security tab in the project page.
 */

export enum SecurityDataCategory {
    ACCESS_CONTROL = 'Access Control',
    BUILD_AND_RELEASE = 'Build and Release',
    DOCUMENTATION = 'Documentation',
    GOVERNANCE = 'Governance',
    LEGAL = 'Legal',
    QUALITY = 'Quality',
    SECURITY_ASSESSMENT = 'Security Assessment',
    VULNERABILITY_MANAGEMENT = 'Vulnerability Management',
}

export enum SecurityDataResult {
    PASSED = 'Passed',
    FAILED = 'Failed',
    NEEDS_REVIEW = 'Needs Review',
}

export interface SecurityAssessmentData {
  requirementId: string;
  description: string;
  message: string;
  recommendation?: string;
  result: SecurityDataResult;
  recommendation?: string;
}

export interface SecurityData {
  category: SecurityDataCategory;
  controlId: string;
  "eval.id": string;
  message: string;
  repo: string;
  result: SecurityDataResult;
  assessments: SecurityAssessmentData[];
}
