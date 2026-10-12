// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createGitHubIssue, createInternalIssue } from '~~/server/data/github/github.api';
import { getAuthUsername } from '~~/server/utils/common';
import { logError } from '~~/server/utils/log';
import { buildIssueTitle, buildIssueBody, buildInternalIssueBody } from '~~/server/utils/report';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import type { ReportRequest } from '~~/types/report/requests.types';

const REPORT_LABELS = ['needs-triage'];
// Keep in sync with INTERNAL_LABELS in .github/workflows/mirror-issue-internal.yml
const INTERNAL_LABELS = [...REPORT_LABELS, 'product-support'];

export default defineEventHandler(async (event): Promise<string> => {
  const body: ReportRequest = await readBody(event);

  const user = event.context.user as DecodedOidcToken | undefined;
  const lfid = user?.sub ? getAuthUsername(user.sub) : 'unknown';
  const email = user?.email ?? 'unknown';

  const title = buildIssueTitle(body);
  const issueBody = buildIssueBody(body);

  let issueData: Awaited<ReturnType<typeof createGitHubIssue>>;
  try {
    issueData = await createGitHubIssue(title, issueBody, REPORT_LABELS);
  } catch (error) {
    logError('report', 'Failed to create GitHub issue', error);
    throw createError({ statusCode: 502, statusMessage: 'Failed to create GitHub issue' });
  }

  // Internal copy is best-effort: the report must succeed even if the private repo
  // or the team project isn't reachable.
  try {
    await createInternalIssue(
      title,
      buildInternalIssueBody(issueBody, issueData?.html_url, lfid, email),
      INTERNAL_LABELS,
    );
  } catch (error) {
    logError('report', 'Failed to create internal copy of the issue', error);
  }

  return issueData?.html_url;
});
