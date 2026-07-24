// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ReportRequest } from '~~/types/report/requests.types';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import { createGitHubIssue } from '~~/server/data/github/github.api';
import { createJiraIssue } from '~~/server/data/jira/jira.api';
import { getAuthUsername } from '~~/server/utils/common';
import { buildIssueTitle, buildIssueBody, buildJiraDescription } from '~~/server/utils/report';

export default defineEventHandler(async (event): Promise<string> => {
  const body: ReportRequest = await readBody(event);
  const config = useRuntimeConfig();

  const user = event.context.user as DecodedOidcToken | undefined;
  const lfid = user?.sub ? getAuthUsername(user.sub) : 'unknown';
  const email = user?.email ?? 'unknown';

  const title = buildIssueTitle(body);
  const issueBody = buildIssueBody(body);

  const issueData = await createGitHubIssue(title, issueBody, ['needs-triage']);

  // Jira mirror is best-effort: the report must succeed even if Jira is down
  // or the DE project/service account isn't configured yet.
  try {
    await createJiraIssue({
      summary: title,
      description: buildJiraDescription(issueBody, issueData?.html_url, lfid, email),
      projectKey: config.jiraReportProjectKey,
      assigneeAccountId: config.jiraReportAssigneeAccountId || undefined,
    });
  } catch (error) {
    console.error('[report] Failed to mirror issue to Jira', error);
  }

  return issueData?.html_url;
});
