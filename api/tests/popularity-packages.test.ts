// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  projectPath,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/popularity/packages';
const pipePath = '/v0/pipes/packages.json';

const repo = 'https://github.com/kubernetes/kubernetes';
const client = 'https://github.com/kubernetes/client-go';

// In no particular order, as the pipe has no ORDER BY.
const pipeRows = [
  { repo, name: 'k8s.io/kubernetes', ecosystem: 'go' },
  { repo: client, name: 'kubernetes', ecosystem: 'pypi' },
  { repo: client, name: 'k8s.io/client-go', ecosystem: 'go' },
  { repo, name: 'k8s.io/client-go', ecosystem: 'go' },
];

const params = (url: URL) => Object.fromEntries(url.searchParams);

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
  it('returns every package sorted by ecosystem, name and repo', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        { name: 'k8s.io/client-go', ecosystem: 'go', repo: client },
        { name: 'k8s.io/client-go', ecosystem: 'go', repo },
        { name: 'k8s.io/kubernetes', ecosystem: 'go', repo },
        { name: 'kubernetes', ecosystem: 'pypi', repo: client },
      ],
    });
  });
});

describe('Tinybird call (AC2)', () => {
  it('sends the project and the search term to the packages pipe once', async () => {
    await get(`${route}?search=Client`);
    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(params(calls[0] as URL)).toMatchObject({ project: 'kubernetes', search: 'Client' });
  });

  it('omits search when the caller sends none or an empty one', async () => {
    await get(route);
    await get(`${route}?search=`);
    for (const url of callsTo(pipePath)) {
      expect(url.searchParams.has('search')).toBe(false);
    }
  });
});

describe('OpenAPI (AC4)', () => {
  it('publishes search as an optional string', async () => {
    const res = await get('/v1-alpha/openapi.json');
    const operation = res.json<OpenApiDoc>().paths[projectPath('popularity/packages')]?.get as
      | OpenApiOperation
      | undefined;
    expect(operation, 'packages is missing from the spec').toBeDefined();
    const search = operation?.parameters?.find((p) => p.name === 'search');
    expect(search?.required).toBeFalsy();
    expect(search?.schema.type).toBe('string');
  });
});
