// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { generateKeyPairSync } from 'node:crypto';

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { decodeJwt } from 'jose';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { createInternalIssue, normalizePrivateKey, signAppJwt } from './github.api';

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pkcs8Pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

const { runtimeConfig, fetchMock } = vi.hoisted(() => ({
  runtimeConfig: {} as Record<string, unknown>,
  fetchMock: { impl: undefined as undefined | ((...args: unknown[]) => unknown) },
}));
// Overlay test values on the real config: the Nuxt test environment reads it while booting.
mockNuxtImport('useRuntimeConfig', (original) => () => Object.assign(original(), runtimeConfig));
mockNuxtImport(
  '$fetch',
  (original) =>
    (...args: unknown[]) =>
      (fetchMock.impl ?? original)(...(args as Parameters<typeof original>)),
);

describe('normalizePrivateKey', () => {
  test('passes through a raw PKCS8 PEM', () => {
    expect(normalizePrivateKey(pkcs8Pem)).toEqual(pkcs8Pem);
  });

  test('normalizes a PEM with escaped newlines', () => {
    const escaped = pkcs8Pem.replace(/\n/g, '\\n');
    expect(normalizePrivateKey(escaped)).toEqual(pkcs8Pem);
  });

  test('normalizes a base64-encoded PEM', () => {
    const base64 = Buffer.from(pkcs8Pem, 'utf8').toString('base64');
    expect(normalizePrivateKey(base64)).toEqual(pkcs8Pem);
  });
});

describe('signAppJwt', () => {
  test('signs a JWT with a string "iss" claim when githubAppId is a number', async () => {
    const jwt = await signAppJwt(123456, pkcs8Pem);
    const { iss } = decodeJwt(jwt);

    expect(typeof iss).toBe('string');
    expect(iss).toBe('123456');
  });

  test('signs a JWT with a string "iss" claim when githubAppId is already a string', async () => {
    const jwt = await signAppJwt('123456', pkcs8Pem);
    const { iss } = decodeJwt(jwt);

    expect(typeof iss).toBe('string');
    expect(iss).toBe('123456');
  });
});

describe('createInternalIssue', () => {
  const project = {
    id: 'PROJECT',
    fields: {
      nodes: [
        { id: 'TEAM', name: 'Team', options: [{ id: 'team-dq', name: 'Data Quality / Support' }] },
        { id: 'STATUS', name: 'Status', options: [{ id: 'status-backlog', name: 'Backlog' }] },
        {},
      ],
    },
  };
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  let graphqlErrors: { message: string }[] | undefined;

  beforeEach(() => {
    Object.assign(runtimeConfig, {
      githubAppId: '1',
      githubAppInstallationId: '2',
      githubAppPrivateKey: pkcs8Pem,
      githubInternalIssuesRepo: 'linuxfoundation/internal',
      githubInternalProjectNumber: 30,
      githubInternalProjectTeam: 'Data Quality / Support',
      githubInternalProjectStatus: 'Backlog',
    });
    calls.length = 0;
    graphqlErrors = undefined;
    fetchMock.impl = vi.fn(async (url: string, opts: { body: Record<string, unknown> }) => {
      calls.push({ url, body: opts.body });
      if (url.endsWith('/access_tokens')) return { token: 'install-token' };
      if (url.endsWith('/issues')) return { html_url: 'https://gh/issue/1', node_id: 'ISSUE' };
      const query = String(opts.body.query);
      if (query.includes('projectV2(number')) {
        return { data: { organization: { projectV2: project } }, errors: graphqlErrors };
      }
      if (query.includes('addProjectV2ItemById')) {
        return {
          data: { addProjectV2ItemById: { item: { id: 'ITEM' } } },
          errors: graphqlErrors,
        };
      }
      return { data: {}, errors: graphqlErrors };
    });
  });

  afterEach(() => {
    fetchMock.impl = undefined;
  });

  test('creates the issue, adds it to the project and sets Team and Status', async () => {
    const issue = await createInternalIssue('Title', 'Body', ['needs-triage', 'Support']);

    expect(issue.html_url).toBe('https://gh/issue/1');
    const steps = calls.map((c) =>
      c.url.endsWith('/graphql')
        ? String(c.body.query).match(
            /(projectV2\(|addProjectV2ItemById|updateProjectV2ItemFieldValue)/,
          )?.[0]
        : c.url,
    );
    expect(steps).toEqual([
      'https://api.github.com/app/installations/2/access_tokens',
      'projectV2(',
      'https://api.github.com/repos/linuxfoundation/internal/issues',
      'addProjectV2ItemById',
      'updateProjectV2ItemFieldValue',
      'updateProjectV2ItemFieldValue',
    ]);
    expect(calls[2]!.body).toMatchObject({
      title: 'Title',
      body: 'Body',
      labels: ['needs-triage', 'Support'],
    });
    expect(calls.slice(4).map((c) => c.body.variables)).toEqual([
      { projectId: 'PROJECT', itemId: 'ITEM', fieldId: 'TEAM', optionId: 'team-dq' },
      { projectId: 'PROJECT', itemId: 'ITEM', fieldId: 'STATUS', optionId: 'status-backlog' },
    ]);
  });

  test('fails before creating the issue when a project option is missing', async () => {
    runtimeConfig.githubInternalProjectTeam = 'Unknown team';

    await expect(createInternalIssue('Title', 'Body')).rejects.toThrow(
      'Project field "Team" has no option "Unknown team"',
    );
    expect(calls.some((c) => c.url.endsWith('/issues'))).toBe(false);
  });

  test('surfaces GraphQL errors', async () => {
    graphqlErrors = [{ message: 'Resource not accessible by integration' }];

    await expect(createInternalIssue('Title', 'Body')).rejects.toThrow(
      'GitHub GraphQL error: Resource not accessible by integration',
    );
    expect(calls.some((c) => c.url.endsWith('/issues'))).toBe(false);
  });
});
