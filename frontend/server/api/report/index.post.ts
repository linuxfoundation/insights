// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ReportRequest } from '~~/types/report/requests.types';
import { createGitHubIssue } from '~~/server/data/github/github.api';

export default defineEventHandler(async (event): Promise<string> => {
  const body: ReportRequest = await readBody(event);
  const description: string[] = [
    '### Page',
    `[${body.url}](${body.url})`,
    ...(body.projectName ? ['### Project', body.projectName] : []),
    ...(body.area ? ['### Issue Area', body.area] : []),
    ...(body.widget ? ['### Widget', body.widget] : []),
    '### Describe the issue',
    body.description,
    '### Steps to reproduce',
    body.steps,
    '### Expected vs. actual behavior',
    body.expectations,
  ];

  const issueBody: string = description.join('\n');

  const issueData = await createGitHubIssue(
    `[Report issue] ${body.projectName ? `${body.projectName} ${body.widget}` : body.pageTitle}`,
    issueBody,
    ['needs-triage'],
  );
  return issueData?.html_url;
});
