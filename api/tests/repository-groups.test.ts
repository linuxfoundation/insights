// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callsTo, mockFetch, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/repository-groups';
const pipePath = '/v0/pipes/repository_groups_list.json';

const kubectl = 'https://github.com/kubernetes/kubectl';
const kustomize = 'https://github.com/kubernetes-sigs/kustomize';
const website = 'https://github.com/kubernetes/website';

// In no particular order, as the pipe has no ORDER BY.
const pipeRows = [
  { name: 'SIG Docs', slug: 'sig-docs', repositories: [website] },
  { name: 'SIG CLI', slug: 'sig-cli-b', repositories: [kustomize] },
  { name: 'Kubernetes', slug: 'kubernetes', repositories: [] },
  { name: 'SIG CLI', slug: 'sig-cli-a', repositories: [kubectl, kustomize] },
  { name: 'apps', slug: 'apps', repositories: [] },
];

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return pipeRows;
    }),
  );
});

describe('response (AC1)', () => {
  // Character codes put 'apps' after every capitalized name, where localeCompare puts it first.
  it('returns every group sorted by name, then slug, comparing character codes', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        { name: 'Kubernetes', slug: 'kubernetes', repositories: [] },
        { name: 'SIG CLI', slug: 'sig-cli-a', repositories: [kubectl, kustomize] },
        { name: 'SIG CLI', slug: 'sig-cli-b', repositories: [kustomize] },
        { name: 'SIG Docs', slug: 'sig-docs', repositories: [website] },
        { name: 'apps', slug: 'apps', repositories: [] },
      ],
    });
  });

  it.each([
    ['a missing name', { slug: 'sig-cli', repositories: [kubectl] }],
    ['a missing slug', { name: 'SIG CLI', repositories: [kubectl] }],
    [
      'repositories that is not a list',
      { name: 'SIG CLI', slug: 'sig-cli', repositories: kubectl },
    ],
    ['a repository that is not a string', { name: 'SIG CLI', slug: 'sig-cli', repositories: [42] }],
  ])('answers 503 for a row with %s', async (_label, row) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockImplementation(tinybirdStub(() => [row]));
    expect((await get(route)).statusCode).toBe(503);
    vi.restoreAllMocks();
  });
});

describe('Tinybird call (AC2)', () => {
  it('sends the project slug to the repository groups pipe once', async () => {
    await get(route);
    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('project')).toBe('kubernetes');
  });
});

describe('unknown project (AC3)', () => {
  it('answers an empty list without calling the repository groups pipe', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => pipeRows, []));
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    expect(callsTo(pipePath)).toHaveLength(0);
  });
});
