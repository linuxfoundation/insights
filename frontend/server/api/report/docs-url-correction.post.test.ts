// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockCreateGitHubIssue = vi.fn();
const mockCreateInternalIssue = vi.fn();
const mockFindProject = vi.fn();
const mockFindContext = vi.fn();
const mockLogError = vi.fn();
const mockReadBody = vi.fn();
const { mockRuntimeConfig } = vi.hoisted(() => ({ mockRuntimeConfig: vi.fn() }));

vi.mock('~~/server/data/github/github.api', () => ({
  createGitHubIssue: (...args: unknown[]) => mockCreateGitHubIssue(...args),
  createInternalIssue: (...args: unknown[]) => mockCreateInternalIssue(...args),
}));
vi.mock('~~/server/repo/insightsProjects.repo', () => ({
  InsightsProjectsRepository: class {
    findInsightsProjectsBySlug = mockFindProject;
  },
}));
vi.mock('~~/server/repo/docsReadiness.repo', () => ({
  DocsReadinessRepository: class {
    findCorrectionContextBySlug = mockFindContext;
  },
}));
vi.mock('~~/server/utils/db', () => ({ getCMDbPool: vi.fn(() => ({})) }));
vi.mock('~~/server/utils/log', () => ({
  logError: (...args: unknown[]) => mockLogError(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler) as never;
global.readBody = mockReadBody as never;
mockNuxtImport('useRuntimeConfig', (original) => () => ({ ...original(), ...mockRuntimeConfig() }));

let handler: (event: H3Event) => Promise<string>;

beforeAll(async () => {
  handler = (await import('./docs-url-correction.post')).default as unknown as typeof handler;
});

const user = { sub: 'auth0|jdoe', email: 'jdoe@example.com' };
const eventFor = (u: unknown = user) => ({ context: { user: u } }) as unknown as H3Event;
const anonymousEvent = { context: {} } as unknown as H3Event;

const body = {
  projectSlug: 'kubernetes',
  url: 'https://insights.linuxfoundation.org/project/kubernetes',
  requestedDocsUrl: 'https://kubernetes.io/docs',
  description: 'Moved',
};

const context = (over: Record<string, unknown> = {}) => ({
  currentDocsUrl: 'https://docs.kubernetes.io',
  candidates: [],
  override: null,
  ...over,
});

const expectStatus = async (promise: Promise<unknown>, statusCode: number) => {
  await expect(promise).rejects.toMatchObject({ statusCode });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockReadBody.mockResolvedValue(body);
  mockRuntimeConfig.mockReturnValue({ cmDbEnabled: true });
  mockFindProject.mockResolvedValue({ name: 'Kubernetes (DB)', isLF: true });
  mockFindContext.mockResolvedValue(context());
  mockCreateGitHubIssue.mockResolvedValue({ html_url: 'https://github.com/x/y/issues/9' });
  mockCreateInternalIssue.mockResolvedValue(undefined);
});

describe('POST /api/report/docs-url-correction', () => {
  it('responds 401 without a user', async () => {
    await expectStatus(handler(anonymousEvent), 401);
    expect(mockCreateGitHubIssue).not.toHaveBeenCalled();
  });

  it('responds 400 for a malformed body', async () => {
    mockReadBody.mockResolvedValue({ projectSlug: '' });
    await expectStatus(handler(eventFor()), 400);
  });

  it('responds 503 when the CM database is disabled', async () => {
    mockRuntimeConfig.mockReturnValue({ cmDbEnabled: false });
    await expectStatus(handler(eventFor()), 503);
  });

  it('responds 404 when the project does not exist', async () => {
    mockFindProject.mockResolvedValue(null);
    await expectStatus(handler(eventFor()), 404);
  });

  it('responds 404 for a non-LF project', async () => {
    mockFindProject.mockResolvedValue({ name: 'X', isLF: false });
    await expectStatus(handler(eventFor()), 404);
  });

  it('responds 500 and logs when a lookup throws', async () => {
    mockFindContext.mockRejectedValue(new Error('db down'));
    await expectStatus(handler(eventFor()), 500);
    expect(mockLogError).toHaveBeenCalled();
    expect(mockCreateGitHubIssue).not.toHaveBeenCalled();
  });

  it('responds 400 for a URL without http(s)', async () => {
    mockReadBody.mockResolvedValue({ ...body, requestedDocsUrl: 'kubernetes.io/docs' });
    await expect(handler(eventFor())).rejects.toMatchObject({
      statusCode: 400,
      data: { reason: 'invalid' },
    });
  });

  it.each([
    'https://github.com/kubernetes/kubernetes',
    'https://gitlab.com/x',
    'https://bitbucket.org/x',
  ])('responds 400 for the repository link %s', async (requestedDocsUrl) => {
    mockReadBody.mockResolvedValue({ ...body, requestedDocsUrl });
    await expect(handler(eventFor())).rejects.toMatchObject({
      statusCode: 400,
      data: { reason: 'repository' },
    });
  });

  it('responds 400 when the requested URL is the current one', async () => {
    mockReadBody.mockResolvedValue({ ...body, requestedDocsUrl: 'https://docs.kubernetes.io/' });
    await expect(handler(eventFor())).rejects.toMatchObject({
      statusCode: 400,
      data: { reason: 'current' },
    });
  });

  it('responds 400 for a no-docs request on a project already confirmed as no docs', async () => {
    mockReadBody.mockResolvedValue({ ...body, requestedDocsUrl: null });
    mockFindContext.mockResolvedValue(
      context({ currentDocsUrl: null, override: { docsUrl: null, submittedAt: '2026-11-01' } }),
    );
    await expectStatus(handler(eventFor()), 400);
  });

  it('creates the public issue with the title, body and labels', async () => {
    mockReadBody.mockResolvedValue({ ...body, projectName: 'Spoofed' });
    await handler(eventFor());

    const [title, issueBody, labels] = mockCreateGitHubIssue.mock.calls[0];
    expect(title).toBe('[Docs URL correction] Kubernetes (DB)');
    expect(issueBody).not.toContain('Spoofed');
    expect(issueBody).toContain('### Requested docs URL\nhttps://kubernetes.io/docs');
    expect(issueBody).toContain('Kubernetes (DB) (`kubernetes`)');
    expect(issueBody).toContain('https://kubernetes.io/docs');
    expect(labels).toEqual(['needs-triage', 'docs-url-correction']);
  });

  it('creates the internal copy with product-support and the reporter footer', async () => {
    await handler(eventFor());

    const [, internalBody, labels] = mockCreateInternalIssue.mock.calls[0];
    expect(labels).toEqual(['needs-triage', 'docs-url-correction', 'product-support']);
    expect(internalBody).toContain('Public issue: https://github.com/x/y/issues/9');
    expect(internalBody).toContain('Reported by: ');
    expect(internalBody).toContain('(jdoe@example.com)');
  });

  it('accepts a no-docs request', async () => {
    mockReadBody.mockResolvedValue({ ...body, requestedDocsUrl: null });
    await handler(eventFor());
    expect(mockCreateGitHubIssue.mock.calls[0][1]).toContain('no documentation site');
  });

  it('responds 502 when the public issue fails', async () => {
    mockCreateGitHubIssue.mockRejectedValue(new Error('github'));
    await expectStatus(handler(eventFor()), 502);
    expect(mockCreateInternalIssue).not.toHaveBeenCalled();
  });

  it('still returns the issue URL when the internal copy fails', async () => {
    mockCreateInternalIssue.mockRejectedValue(new Error('private repo'));
    await expect(handler(eventFor())).resolves.toBe('https://github.com/x/y/issues/9');
    expect(mockLogError).toHaveBeenCalled();
  });

  it('returns the public issue URL', async () => {
    await expect(handler(eventFor())).resolves.toBe('https://github.com/x/y/issues/9');
  });
});
