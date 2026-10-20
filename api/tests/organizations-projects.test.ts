// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  tinybirdError,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/organizations/microsoft/projects';
const pipePath = '/v0/pipes/org_page_projects.json';
const profilePath = '/v0/pipes/org_page_profile.json';

// The pipe returns more columns than the endpoint exposes.
const projectRow = (slug: string, technicalScore: number) => ({
  projectSlug: slug,
  projectName: `Project ${slug}`,
  projectLogo: `https://example.org/${slug}.png`,
  activityCount: 500,
  contributorCount: 40,
  maintainersCount: 2,
  totalContributors: 900,
  orgContributors: 40,
  totalCommits: 5000,
  orgCommits: 300,
  totalPrsOpened: 1200,
  orgPrsOpened: 90,
  technicalScore,
});

const profileRow = {
  displayName: 'Microsoft',
  logo: '',
  employeeCount: '',
  industry: '',
  description: '',
  website: null,
  domain: null,
  membership: null,
};

let projects: unknown[] = [];
let profile: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  projects = [projectRow('vscode', 32.5), projectRow('typescript', 7)];
  profile = [profileRow];
  mockFetch.mockImplementation(
    tinybirdStub((url) => (url.pathname === profilePath ? profile : projects)),
  );
});

describe('GET /v1-alpha/organizations/{slug}/projects', () => {
  it('returns the projects of the organization', async () => {
    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          slug: 'vscode',
          name: 'Project vscode',
          logoUrl: 'https://example.org/vscode.png',
          contributionCount: 500,
          contributorCount: 40,
          technicalScore: 32.5,
          technicalInfluence: 'leading',
        },
        {
          slug: 'typescript',
          name: 'Project typescript',
          logoUrl: 'https://example.org/typescript.png',
          contributionCount: 500,
          contributorCount: 40,
          technicalScore: 7,
          technicalInfluence: 'contributing',
        },
      ],
      pageSize: 50,
      nextCursor: null,
    });
  });

  it('asks the pipe for one row more than the page, from the start', async () => {
    await get(route);

    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('orgSlug')).toBe('microsoft');
    expect(calls[0]?.searchParams.get('limit')).toBe('51');
    expect(calls[0]?.searchParams.get('offset')).toBe('0');
    expect(callsTo(profilePath)).toHaveLength(0);
  });

  it.each([
    [15, 'leading'],
    [14.9, 'contributing'],
    [5, 'contributing'],
    [4.9, 'participating'],
    [1, 'participating'],
    [0.5, 'silent'],
    [0, 'silent'],
  ])('bands a score of %s as %s', async (score, influence) => {
    projects = [projectRow('vscode', score)];

    expect((await get(route)).json().data[0].technicalInfluence).toBe(influence);
  });

  it('returns null logoUrl for a project without a logo', async () => {
    projects = [{ ...projectRow('vscode', 1), projectLogo: '' }];

    expect((await get(route)).json().data[0].logoUrl).toBeNull();
  });

  it('pages with a cursor when the pipe returns the extra row', async () => {
    projects = [projectRow('a', 3), projectRow('b', 2), projectRow('c', 1)];

    const first = (await get(`${route}?pageSize=2`)).json();

    expect(first.data.map((project: { slug: string }) => project.slug)).toEqual(['a', 'b']);
    expect(first.nextCursor).toEqual(expect.any(String));

    projects = [projectRow('c', 1)];
    const second = (await get(`${route}?pageSize=2&cursor=${first.nextCursor}`)).json();

    expect(second.data.map((project: { slug: string }) => project.slug)).toEqual(['c']);
    expect(second.nextCursor).toBeNull();
    const lastCall = callsTo(pipePath).at(-1);
    expect(lastCall?.searchParams.get('limit')).toBe('3');
    expect(lastCall?.searchParams.get('offset')).toBe('2');
  });

  it('returns an empty page for a known organization without projects', async () => {
    projects = [];

    const response = await get(route);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [], pageSize: 50, nextCursor: null });
    expect(callsTo(profilePath)[0]?.searchParams.get('orgSlug')).toBe('microsoft');
  });

  it('returns 404 for an unknown or blocked organization', async () => {
    projects = [];
    profile = [];

    expect((await get(route)).statusCode).toBe(404);
  });

  it('returns 400 for a cursor it did not issue', async () => {
    expect((await get(`${route}?cursor=not-a-cursor`)).statusCode).toBe(400);
    expect(callsTo(pipePath)).toHaveLength(0);
  });

  it('returns 503 when the pipe fails', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(500)));

    const response = await get(route);

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('tinybird internal detail');
  });

  it.each([
    ['an empty project slug', { projectSlug: '' }],
    ['a numeric project name', { projectName: 1 }],
    ['a negative contribution count', { activityCount: -1 }],
    ['a fractional contributor count', { contributorCount: 1.5 }],
    ['a negative technical score', { technicalScore: -1 }],
    ['a string technical score', { technicalScore: '7' }],
  ])('returns 503 for %s', async (_name, change) => {
    projects = [{ ...projectRow('vscode', 1), ...change }];

    expect((await get(route)).statusCode).toBe(503);
  });

  it('is listed in the OpenAPI document under Organizations', async () => {
    const doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
    const operation = doc.paths['/v1-alpha/organizations/{slug}/projects']?.get;

    expect(operation?.tags).toEqual(['Organizations']);
    expect(operation?.summary).toBeTruthy();
    expect(operation?.parameters?.map((parameter) => parameter.name)).toEqual(
      expect.arrayContaining(['cursor', 'pageSize']),
    );
  });
});
