// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ReportRequest } from '~~/types/report/requests.types';

export function buildIssueTitle(body: ReportRequest): string {
  return `[Report issue] ${body.projectName ? `${body.projectName} ${body.widget}` : body.pageTitle}`;
}

export function buildIssueBody(body: ReportRequest): string {
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

  return description.join('\n');
}

export function buildJiraDescription(
  issueBody: string,
  githubUrl: string,
  lfid: string,
  email: string,
): string {
  return [
    issueBody,
    '---',
    `GitHub issue: ${githubUrl}`,
    `Issue created by user: ${lfid} ${email}`,
  ].join('\n\n');
}
