// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { SecurityDataCategory } from '~~/types/security/responses.types';

export interface SecurityCategoryConfig {
  description: string;
}

export const lfxSecurityCategories: Record<SecurityDataCategory, SecurityCategoryConfig> = {
  [SecurityDataCategory.ACCESS_CONTROL]: {
    description:
      'Access Control ensures only authorized users access version control and CI/CD pipelines to protect sensitive data.',
  },
  [SecurityDataCategory.BUILD_AND_RELEASE]: {
    description:
      'Build and Release ensures secure, consistent software builds and distribution through controlled tools and processes.',
  },
  [SecurityDataCategory.DOCUMENTATION]: {
    description:
      "Ensure that the project's documentation is comprehensive, accurate, and up-to-date, enabling users to understand the project's features and functionality.",
  },
  [SecurityDataCategory.GOVERNANCE]: {
    description:
      'Governance defines policies and processes to guide decisions and community actions, ensuring readiness for risks and growth.',
  },
  [SecurityDataCategory.LEGAL]: {
    description:
      'Legal ensures code is under a valid open source license, reducing IP risks and ensuring proper licensing and distribution.',
  },
  [SecurityDataCategory.QUALITY]: {
    description:
      'Quality ensures code is secure, reliable, and well-maintained through strong processes, reducing bugs and vulnerabilities.',
  },
  [SecurityDataCategory.SECURITY_ASSESSMENT]: {
    description:
      'Security Assessment promotes practices to help identify and address software vulnerabilities and threats effectively.',
  },
  [SecurityDataCategory.VULNERABILITY_MANAGEMENT]: {
    description:
      'Vulnerability Management ensures timely detection and response to security issues in software dependencies and threats.',
  },
};
