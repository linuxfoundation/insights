// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone API route for the "Security coverage on GitHub-hosted repositories" widget
// (IN-1293). Not yet wired into the shared health-score-coverage report view/service - see
// health-score-coverage-github-security.types.ts.
//
// Unlike the other widgets' routes, this one takes no `scope` query param: the
// `health_score_report_github_security` pipe returns both the LF and Other columns in a single
// call (see its DESCRIPTION block), so there is nothing to filter by.

import { fetchHealthScoreCoverageGithubSecurity } from '~~/server/data/tinybird/report/health-score-coverage-github-security';
import type { HealthScoreCoverageGithubSecurityData } from '~~/types/report/health-score-coverage-github-security.types';

export default defineEventHandler(async (): Promise<HealthScoreCoverageGithubSecurityData> => {
  try {
    return await fetchHealthScoreCoverageGithubSecurity();
  } catch (error: unknown) {
    console.error('[health-score-coverage/github-security] error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score coverage github security',
    });
  }
});
