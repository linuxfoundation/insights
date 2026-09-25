// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, queryString, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/security/vulnerabilities';
const pipePath = '/v0/pipes/vulnerabilities_list.json';

const repo = 'https://github.com/kubernetes/kubernetes';
const cursorFor = (offset: number) => Buffer.from(String(offset)).toString('base64url');

const pipeRow = (index: number) => ({
  vulnerabilityId: `GHSA-${index}`,
  cveId: `CVE-2026-${index}`,
  packageName: `package-${index}`,
  severity: 'HIGH',
  description: `Vulnerability ${index}.`,
  ecosystem: 'npm',
  publishedAt: '2026-09-17 17:16:02.000',
  status: 'FIX_AVAILABLE',
  paths: [`${repo}/blob/HEAD/package.json`],
  fixedVersion: '1.2.3',
  referenceLink: `https://osv.dev/GHSA-${index}`,
});

// The list pages by page number, as the pipe does: rows from page * pageSize, pageSize of them.
let all: unknown[] = [];
let countRows: unknown[] | undefined;

const { get } = useApp();

beforeEach(() => {
  all = Array.from({ length: 5 }, (_, index) => pipeRow(index));
  countRows = undefined;
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      const params = url.searchParams;
      if (params.get('count') === 'true') {
        return countRows ?? [{ count: all.length }];
      }
      const size = Number(params.get('pageSize'));
      const start = Number(params.get('page')) * size;
      return all.slice(start, start + size);
    }),
  );
});

const listCalls = () => callsTo(pipePath).filter((url) => url.searchParams.get('count') !== 'true');
const countCalls = () =>
  callsTo(pipePath).filter((url) => url.searchParams.get('count') === 'true');
const pagesAsked = () =>
  listCalls().map((url) => [url.searchParams.get('page'), url.searchParams.get('pageSize')]);
const ids = (body: { data: { vulnerabilityId: string }[] }) =>
  body.data.map((item) => item.vulnerabilityId);

describe('Tinybird call (AC1)', () => {
  it('sends the project, repos, filters and order to the list and count calls', async () => {
    const res = await get(
      `${route}?${queryString({
        repos: repo,
        severity: 'CRITICAL',
        status: 'OPEN',
        ecosystem: 'npm',
        order: 'asc',
      })}`,
    );
    expect(res.statusCode).toBe(200);
    expect(listCalls()).toHaveLength(1);
    expect(countCalls()).toHaveLength(1);
    for (const call of [...listCalls(), ...countCalls()]) {
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.getAll('repos').join(',')).toContain(repo);
      expect(call.searchParams.get('severity')).toBe('CRITICAL');
      expect(call.searchParams.get('status')).toBe('OPEN');
      expect(call.searchParams.get('ecosystem')).toBe('npm');
      expect(call.searchParams.get('orderByDirection')).toBe('asc');
    }
  });

  it('orders newest first by default', async () => {
    await get(route);
    expect(listCalls()[0]?.searchParams.get('orderByDirection')).toBe('desc');
  });

  it('leaves out an empty ecosystem and absent filters', async () => {
    await get(`${route}?ecosystem=`);
    for (const call of callsTo(pipePath)) {
      expect(call.searchParams.has('ecosystem')).toBe(false);
      expect(call.searchParams.has('severity')).toBe(false);
      expect(call.searchParams.has('status')).toBe(false);
    }
  });

  it.each([
    ['a severity outside the enum', { severity: 'SEVERE' }],
    ['a status outside the enum', { status: 'CLOSED' }],
    ['an order outside desc and asc', { order: 'newest' }],
  ])('answers 400 for %s', async (_label, params) => {
    const res = await get(`${route}?${queryString(params)}`);
    expect(res.statusCode).toBe(400);
    expect(callsTo(pipePath)).toHaveLength(0);
  });
});

describe('paging (AC2)', () => {
  it('asks for page 0 of pageSize by default', async () => {
    const res = await get(route);
    expect(res.json()).toMatchObject({ pageSize: 50, nextCursor: null });
    expect(pagesAsked()).toEqual([['0', '50']]);
  });

  it('follows nextCursor to the next pipe page while rows remain', async () => {
    const first = await get(`${route}?pageSize=2`);
    expect(ids(first.json())).toEqual(['GHSA-0', 'GHSA-1']);
    expect(first.json().nextCursor).toEqual(expect.any(String));

    mockFetch.mockClear();
    const second = await get(`${route}?pageSize=2&cursor=${first.json().nextCursor}`);
    expect(pagesAsked()).toEqual([['1', '2']]);
    expect(ids(second.json())).toEqual(['GHSA-2', 'GHSA-3']);

    const third = await get(`${route}?pageSize=2&cursor=${second.json().nextCursor}`);
    expect(ids(third.json())).toEqual(['GHSA-4']);
    expect(third.json().nextCursor).toBeNull();
  });

  it('ends the list when the page reaches the count exactly', async () => {
    all = all.slice(0, 4);
    const res = await get(`${route}?pageSize=2&cursor=${cursorFor(2)}`);
    expect(ids(res.json())).toEqual(['GHSA-2', 'GHSA-3']);
    expect(res.json().nextCursor).toBeNull();
  });

  it('keeps its position when pageSize changes between requests', async () => {
    const res = await get(`${route}?pageSize=2&cursor=${cursorFor(3)}`);
    expect(pagesAsked().sort()).toEqual([
      ['1', '2'],
      ['2', '2'],
    ]);
    expect(ids(res.json())).toEqual(['GHSA-3', 'GHSA-4']);
    expect(res.json().nextCursor).toBeNull();
  });

  it('points nextCursor at the row after the page', async () => {
    all = Array.from({ length: 9 }, (_, index) => pipeRow(index));
    const res = await get(`${route}?pageSize=3&cursor=${cursorFor(1)}`);
    expect(ids(res.json())).toEqual(['GHSA-1', 'GHSA-2', 'GHSA-3']);
    expect(res.json().nextCursor).toBe(cursorFor(4));
  });

  it('treats an empty count response as zero rows', async () => {
    all = [];
    countRows = [];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [], pageSize: 50, nextCursor: null });
  });
});

describe('response mapping (AC3)', () => {
  it('returns each vulnerability with ISO timestamps', async () => {
    all = [pipeRow(0)];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      {
        ...pipeRow(0),
        publishedAt: '2026-09-17T17:16:02.000Z',
      },
    ]);
  });

  it('answers null for empty optional fields and a missing publish date', async () => {
    all = [
      {
        ...pipeRow(0),
        cveId: '',
        description: '',
        fixedVersion: '',
        referenceLink: '',
        publishedAt: null,
        status: 'OPEN',
      },
    ];
    const item = (await get(route)).json().data[0];
    expect(item).toMatchObject({
      cveId: null,
      description: null,
      fixedVersion: null,
      referenceLink: null,
      publishedAt: null,
    });
  });

  it('keeps the pipe order', async () => {
    all = [pipeRow(3), pipeRow(1), pipeRow(2)];
    expect(ids((await get(route)).json())).toEqual(['GHSA-3', 'GHSA-1', 'GHSA-2']);
  });
});

describe('row guard (AC4)', () => {
  const good = pipeRow(0);

  it.each([
    ['a missing vulnerabilityId', { ...good, vulnerabilityId: undefined }],
    ['a numeric packageName', { ...good, packageName: 7 }],
    ['a severity outside the enum', { ...good, severity: 'SEVERE' }],
    ['a status outside the enum', { ...good, status: 'CLOSED' }],
    ['paths that are not a list', { ...good, paths: 'package.json' }],
    ['a path that is not a string', { ...good, paths: [3] }],
    ['a publishedAt that is not a pipe timestamp', { ...good, publishedAt: 'yesterday' }],
    ['a missing fixedVersion', { ...good, fixedVersion: undefined }],
  ])('answers 503 for %s', async (_label, row) => {
    all = [good, row];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });

  it.each([
    ['a negative count', [{ count: -1 }]],
    ['a fractional count', [{ count: 1.5 }]],
    ['a string count', [{ count: '5' }]],
    ['a missing count', [{}]],
  ])('answers 503 for %s', async (_label, rows) => {
    countRows = rows;
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });
});

describe('unknown project (AC5)', () => {
  it('answers an empty page without calling the pipe', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [pipeRow(0)], []));
    const res = await get(`${route}?pageSize=20`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [], pageSize: 20, nextCursor: null });
    expect(callsTo(pipePath)).toHaveLength(0);
  });
});
