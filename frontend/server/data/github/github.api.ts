// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createPrivateKey } from 'node:crypto';

import { SignJWT, importPKCS8 } from 'jose';

import { useRuntimeConfig } from '#imports';

// Accept either a base64-encoded key or the raw PEM text pasted directly (with real or
// escaped "\n" newlines) - env vars commonly end up holding either form.
// GitHub issues PKCS#1 keys ("BEGIN RSA PRIVATE KEY"); jose's importPKCS8 only accepts PKCS#8.
// node:crypto auto-detects the input format, so re-exporting as pkcs8 normalizes either one.
export function normalizePrivateKey(rawKey: string): string {
  const pem = rawKey.includes('BEGIN')
    ? rawKey.replace(/\\n/g, '\n')
    : Buffer.from(rawKey, 'base64').toString('utf8');
  return createPrivateKey(pem).export({ type: 'pkcs8', format: 'pem' }).toString();
}

// githubAppId can arrive as a number from runtime config; jose requires a string "iss".
export async function signAppJwt(githubAppId: unknown, privateKeyPem: string): Promise<string> {
  const pkcs8Pem = normalizePrivateKey(privateKeyPem);
  const key = await importPKCS8(pkcs8Pem, 'RS256');
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt(now - 60) // clock-skew slack
    .setExpirationTime(now + 540) // GitHub App JWTs max out at 10 minutes
    .setIssuer(String(githubAppId))
    .sign(key);
}

// ponytail: no installation-token caching - minted per request. Installation tokens
// are valid ~1h; add an in-memory cache keyed by expiry if report volume hits rate limits.
async function getInstallationToken(): Promise<string> {
  const { githubAppId, githubAppInstallationId, githubAppPrivateKey } = useRuntimeConfig();

  if (!githubAppId || !githubAppInstallationId || !githubAppPrivateKey) {
    throw new Error('GitHub App credentials are not configured');
  }

  const appJwt = await signAppJwt(githubAppId, githubAppPrivateKey);

  const { token } = await $fetch<{ token: string }>(
    `https://api.github.com/app/installations/${githubAppInstallationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  return token;
}

interface CreatedIssue {
  html_url: string;
  node_id: string;
}

async function postIssue(
  token: string,
  repo: string,
  title: string,
  body: string,
  labels: string[],
  assignees: string[] = [],
): Promise<CreatedIssue> {
  return await $fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
    body: {
      title,
      body,
      labels,
      assignees,
    },
  });
}

export async function createGitHubIssue(
  title: string,
  body: string,
  labels: string[] = [],
  assignees: string[] = [],
): Promise<CreatedIssue> {
  const token = await getInstallationToken();
  return await postIssue(token, 'linuxfoundation/insights', title, body, labels, assignees);
}

async function githubGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const { data, errors } = await $fetch<{ data: T; errors?: { message: string }[] }>(
    'https://api.github.com/graphql',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { query, variables },
    },
  );
  if (errors?.length) {
    throw new Error(`GitHub GraphQL error: ${errors.map((e) => e.message).join('; ')}`);
  }
  return data;
}

interface ProjectField {
  id?: string;
  name?: string;
  options?: { id: string; name: string }[];
}

const PROJECT_QUERY = `query($owner: String!, $number: Int!) {
  organization(login: $owner) {
    projectV2(number: $number) {
      id
      fields(first: 50) { nodes { ... on ProjectV2SingleSelectField { id name options { id name } } } }
    }
  }
}`;

const ADD_ITEM_MUTATION = `mutation($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } }
}`;

const SET_FIELD_MUTATION = `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { singleSelectOptionId: $optionId }
  }) { projectV2Item { id } }
}`;

export async function createInternalIssue(
  title: string,
  body: string,
  labels: string[] = [],
): Promise<CreatedIssue> {
  const {
    githubInternalIssuesRepo,
    githubInternalProjectNumber,
    githubInternalProjectTeam,
    githubInternalProjectStatus,
  } = useRuntimeConfig();

  const token = await getInstallationToken();

  // Resolve the project fields before creating the issue, so a misconfigured project fails
  // without leaving an issue outside the project.
  const [owner] = githubInternalIssuesRepo.split('/');
  const { organization } = await githubGraphql<{
    organization: { projectV2: { id: string; fields: { nodes: ProjectField[] } } | null };
  }>(token, PROJECT_QUERY, { owner, number: Number(githubInternalProjectNumber) });
  const project = organization.projectV2;
  if (!project) {
    throw new Error(`Project ${owner}#${githubInternalProjectNumber} not found`);
  }
  const fieldValues = (
    [
      ['Team', githubInternalProjectTeam],
      ['Status', githubInternalProjectStatus],
    ] as const
  ).map(([fieldName, optionName]) => {
    const field = project.fields.nodes.find((f) => f.name === fieldName);
    const option = field?.options?.find((o) => o.name === optionName);
    if (!field?.id || !option) {
      throw new Error(`Project field "${fieldName}" has no option "${optionName}"`);
    }
    return { fieldId: field.id, optionId: option.id };
  });

  await ensureLabels(token, githubInternalIssuesRepo, labels);
  const issue = await postIssue(token, githubInternalIssuesRepo, title, body, labels);

  // Both mutations are idempotent, so transient failures are retried. A final failure names the
  // created issue, because nothing else revisits report-form copies.
  try {
    await withRetry(async () => {
      const { addProjectV2ItemById } = await githubGraphql<{
        addProjectV2ItemById: { item: { id: string } };
      }>(token, ADD_ITEM_MUTATION, { projectId: project.id, contentId: issue.node_id });

      for (const { fieldId, optionId } of fieldValues) {
        await githubGraphql(token, SET_FIELD_MUTATION, {
          projectId: project.id,
          itemId: addProjectV2ItemById.item.id,
          fieldId,
          optionId,
        });
      }
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Created ${issue.html_url} but could not add it to the project: ${reason}`, {
      cause: error,
    });
  }

  return issue;
}

interface FetchFailure {
  status?: number;
  data?: { errors?: { code?: string }[] };
}

// Labels are per repository, so create any the target repo lacks before the issue references them.
async function ensureLabels(token: string, repo: string, labels: string[]): Promise<void> {
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
  for (const name of labels) {
    try {
      await $fetch(`https://api.github.com/repos/${repo}/labels/${encodeURIComponent(name)}`, {
        headers,
      });
    } catch (error) {
      if ((error as FetchFailure).status !== 404) throw error;
      try {
        await $fetch(`https://api.github.com/repos/${repo}/labels`, {
          method: 'POST',
          headers,
          body: { name, color: 'ededed' },
        });
      } catch (createError) {
        // A concurrent report may have just created it.
        const { status, data } = createError as FetchFailure;
        const exists = status === 422 && data?.errors?.some((e) => e.code === 'already_exists');
        if (!exists) throw createError;
      }
    }
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}
