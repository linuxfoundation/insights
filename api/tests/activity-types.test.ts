// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mockFetch,
  parameterDescription,
  pipeCalls,
  projectPath,
  queryString,
  resolveSchema,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const pipePath = '/v0/pipes/activityTypes_by_project.json';

// In the pipe's own order, activityType then platform, so git shows up before gerrit.
const pipeRows = [
  { activityType: 'authored-commit', platform: 'git', label: 'Authored a commit' },
  { activityType: 'changeset-created', platform: 'gerrit', label: 'Created a changeset' },
  { activityType: 'issues-opened', platform: 'github', label: 'Opened an issue' },
  { activityType: 'issues-opened', platform: 'gitlab', label: 'Opened an issue' },
  { activityType: 'merge_request-opened', platform: 'gitlab', label: 'Opened a merge request' },
  { activityType: 'patchset-created', platform: 'gerrit', label: 'Created a patchset' },
  { activityType: 'patchset_approval-created', platform: 'gerrit', label: 'Approved a patchset' },
  { activityType: 'pull_request-opened', platform: 'github', label: 'Opened a pull request' },
];

// Character-code order puts `-` before `_`, so patchset-created leads, where locale order would
// put it last.
const expectedData = [
  {
    platform: 'gerrit',
    activityTypes: [
      { key: 'changeset-created', label: 'Created a changeset' },
      { key: 'patchset-created', label: 'Created a patchset' },
      { key: 'patchset_approval-created', label: 'Approved a patchset' },
    ],
  },
  { platform: 'git', activityTypes: [{ key: 'authored-commit', label: 'Authored a commit' }] },
  {
    platform: 'github',
    activityTypes: [
      { key: 'issues-opened', label: 'Opened an issue' },
      { key: 'pull_request-opened', label: 'Opened a pull request' },
    ],
  },
  {
    platform: 'gitlab',
    activityTypes: [
      { key: 'issues-opened', label: 'Opened an issue' },
      { key: 'merge_request-opened', label: 'Opened a merge request' },
    ],
  },
];

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/activity-types?${queryString(params)}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(tinybirdStub(() => pipeRows));
});

describe('GET /v1-alpha/projects/{slug}/activity-types (AC1)', () => {
  it('groups the rows by platform, listing a key under every platform that has it', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: expectedData });
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      tinybirdStub(() => pipeRows.map((row) => ({ ...row, isCodeContribution: 1, extra: 'x' }))),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: { activityTypes: object[] }[] }>();
    expect(Object.keys(body)).toEqual(['data']);
    for (const group of body.data) {
      expect(Object.keys(group).sort()).toEqual(['activityTypes', 'platform']);
      for (const type of group.activityTypes) {
        expect(Object.keys(type).sort()).toEqual(['key', 'label']);
      }
    }
  });
});

describe('order (AC2)', () => {
  it('sorts platforms, and keys within each platform, by character code whatever the pipe order', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [...pipeRows].reverse()));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual(expectedData);
  });
});

describe('a relabelled activity type (AC3)', () => {
  const relabelled = [
    { activityType: 'issues-opened', platform: 'github', label: 'Opened an issue' },
    { activityType: 'issues-opened', platform: 'github', label: 'Issue opened' },
  ];

  it.each([
    ['in the order the labels sort', [...relabelled].reverse()],
    ['in the reverse order', relabelled],
  ])(
    'lists the key once per platform with the label that sorts first, arriving %s',
    async (_, rows) => {
      mockFetch.mockImplementation(
        tinybirdStub(() => [
          ...rows,
          { activityType: 'issues-opened', platform: 'gitlab', label: 'Opened an issue' },
        ]),
      );
      const res = await get(url());
      expect(res.statusCode).toBe(200);
      expect(res.json().data).toEqual([
        { platform: 'github', activityTypes: [{ key: 'issues-opened', label: 'Issue opened' }] },
        { platform: 'gitlab', activityTypes: [{ key: 'issues-opened', label: 'Opened an issue' }] },
      ]);
    },
  );
});

describe('Tinybird call (AC4, AC5)', () => {
  it('makes one activityTypes_by_project call with the slug, the bucket and the default flags', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0]?.origin).toBe(tinybirdHost);
    expect(calls[0]?.pathname).toBe(pipePath);
    expect(Object.fromEntries(calls[0]?.searchParams ?? [])).toEqual({
      project: 'kubernetes',
      bucketId: '7',
      includeCodeContributions: 'true',
      includeCollaborations: 'false',
      includeOtherContributions: 'false',
    });
  });

  it.each([
    ['includeCodeContributions', 'false'],
    ['includeCollaborations', 'true'],
    ['includeOtherContributions', 'true'],
  ])('forwards %s=%s alone, keeping the other flags at their defaults', async (flag, value) => {
    const defaults = {
      includeCodeContributions: 'true',
      includeCollaborations: 'false',
      includeOtherContributions: 'false',
    };
    const res = await get(url({ [flag]: value }));
    expect(res.statusCode).toBe(200);
    const [call] = pipeCalls();
    const sent = Object.fromEntries(
      Object.keys(defaults).map((name) => [name, call?.searchParams.get(name)]),
    );
    expect(sent).toEqual({ ...defaults, [flag]: value });
  });

  it('rejects an includeOtherContributions that is not a boolean before calling Tinybird', async () => {
    const res = await get(url({ includeOtherContributions: 'maybe' }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('empty results (AC6)', () => {
  it('returns an empty list when the pipe has no rows', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => []));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
  });

  it('returns an empty list for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(tinybirdStub(() => pipeRows, []));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    vi.restoreAllMocks();
  });
});

describe('malformed pipe rows (AC7)', () => {
  it.each([
    ['without a label', { activityType: 'issues-opened', platform: 'github' }],
    ['with a null platform', { activityType: 'issues-opened', platform: null, label: 'Opened' }],
    ['with a numeric activityType', { activityType: 7, platform: 'github', label: 'Opened' }],
  ])('maps a row %s to 503 upstream_unavailable', async (_, row) => {
    mockFetch.mockImplementation(tinybirdStub(() => [pipeRows[0], row]));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('is required');
  });
});

describe('OpenAPI (AC8)', () => {
  const documented = async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const operation = spec.paths[projectPath('activity-types')]?.get;
    const body = resolveSchema(
      spec,
      operation?.responses['200']?.content['application/json']?.schema,
    );
    const group = resolveSchema(spec, body?.properties?.data?.items);
    const type = resolveSchema(spec, group?.properties?.activityTypes?.items);
    return { operation, group, type };
  };

  it('takes repos and the three flags, all optional, with the flag defaults', async () => {
    const { operation } = await documented();
    const query = operation?.parameters?.filter((param) => param.in === 'query');
    expect(query?.map((param) => param.name).sort()).toEqual([
      'includeCodeContributions',
      'includeCollaborations',
      'includeOtherContributions',
      'repos',
    ]);
    for (const param of query ?? []) {
      expect(param.required, param.name).toBeFalsy();
    }
    const schemaOf = (name: string) => query?.find((param) => param.name === name)?.schema;
    expect(schemaOf('includeCodeContributions')).toMatchObject({ type: 'boolean', default: true });
    expect(schemaOf('includeCollaborations')).toMatchObject({ type: 'boolean', default: false });
    expect(schemaOf('includeOtherContributions')).toMatchObject({
      type: 'boolean',
      default: false,
    });
  });

  it('says what includeOtherContributions adds', async () => {
    const { operation } = await documented();
    const param = operation?.parameters?.find((p) => p.name === 'includeOtherContributions');
    expect(parameterDescription(param)).toMatch(/neither a code contribution nor a collaboration/i);
  });

  it('states the order and points platform and key at the platform and activityType filters', async () => {
    const { operation, group, type } = await documented();
    expect(operation?.description).toMatch(/sorted by `platform`/i);
    expect(operation?.description).toMatch(/by `key`/i);
    expect(group?.properties?.platform?.description).toMatch(/as `platform`/i);
    expect(type?.properties?.key?.description).toMatch(/as `activityType`/i);
  });
});
