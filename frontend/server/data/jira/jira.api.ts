// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from '#imports';

export interface CreateJiraIssueParams {
  summary: string;
  description: string;
  projectKey: string;
  assigneeAccountId?: string;
}

// cloudId never changes for a given site, so it's cached in memory for the process lifetime.
let cachedCloudId: string | undefined;

async function getCloudId(jiraBaseUrl: string): Promise<string> {
  if (!cachedCloudId) {
    const { cloudId } = await $fetch<{ cloudId: string }>(`${jiraBaseUrl}/_edge/tenant_info`);
    cachedCloudId = cloudId;
  }
  return cachedCloudId;
}

// ponytail: no token cache — minted per request; add in-memory cache keyed by expires_in if JIRA rate-limits bite.
async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const { access_token: accessToken } = await $fetch<{ access_token: string }>(
    'https://auth.atlassian.com/oauth/token',
    {
      method: 'POST',
      body: {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      },
    },
  );
  return accessToken;
}

export async function createJiraIssue({
  summary,
  description,
  projectKey,
  assigneeAccountId,
}: CreateJiraIssueParams): Promise<{ key: string }> {
  const { jiraBaseUrl, jiraClientId, jiraClientSecret } = useRuntimeConfig();

  if (!jiraClientId || !jiraClientSecret) {
    throw new Error('Jira credentials are not configured');
  }

  const [cloudId, accessToken] = await Promise.all([
    getCloudId(jiraBaseUrl),
    getAccessToken(jiraClientId, jiraClientSecret),
  ]);

  return await $fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/2/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: {
      fields: {
        project: { key: projectKey },
        issuetype: { name: 'Task' },
        summary,
        description,
        ...(assigneeAccountId ? { assignee: { accountId: assigneeAccountId } } : {}),
      },
    },
  });
}
