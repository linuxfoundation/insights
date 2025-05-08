// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 These are the types for the responses the frontend expects from the API for the security tab in the project page.
 */

export enum SecurityDataResult {
    PASSED = 'Passed',
    FAILED = 'Failed',
    NEEDS_REVIEW = 'Needs Review',
}

export interface SecurityAssessmentData {
  requirementId: string;
  description: string;
  result: SecurityDataResult;
}

export interface SecurityData {
  category: string;
  controlId: string;
  "eval.id": string;
  message: string;
  repo: string;
  result: SecurityDataResult;
  assessments: SecurityAssessmentData[];
}
