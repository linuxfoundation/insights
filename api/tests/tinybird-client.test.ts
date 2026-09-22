// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyBaseLogger } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInMemoryBucketCache } from '../src/clients/bucket-cache.js';
import { fetchPipe, getTinybirdClient, withBucket } from '../src/clients/tinybird.js';
import { UpstreamUnavailableError } from '../src/lib/errors.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const bucketsPath = '/v0/pipes/project_buckets.json';
const pipePath = '/v0/pipes/activities_count.json';
const upstreamDetail = 'internal tinybird detail';

interface Row {
  activityCount: number;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const tinybirdRows = (rows: unknown) =>
  jsonResponse({
    data: rows,
    meta: [],
    rows: 0,
    statistics: { elapsed: 0, rows_read: 0, bytes_read: 0 },
  });

// Routes rows by pipe path; a path with no entry is a test bug, so it throws.
function serve(byPath: Record<string, (url: URL) => Response | Promise<Response>>) {
  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const handler = byPath[url.pathname];
    if (!handler) {
      throw new Error(`unexpected Tinybird path ${url.pathname}`);
    }
    return handler(url);
  });
}

const calledUrls = () => mockFetch.mock.calls.map((call) => new URL(String(call[0])));
const callsTo = (path: string) => calledUrls().filter((url) => url.pathname === path);

// The wrapper only needs the request's logger, so a bare object stands in for FastifyRequest.
function fakeRequest() {
  const error = vi.fn();
  return { request: { log: { error } as unknown as FastifyBaseLogger }, error };
}

async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  throw new Error('expected the promise to reject');
}

beforeAll(() => {
  vi.stubEnv('API_TB_HOST', tinybirdHost);
  vi.stubEnv('API_TB_TOKEN', 'test-token');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

beforeEach(async () => {
  mockFetch.mockReset();
  await getTinybirdClient().clearAllBucketCaches();
});

describe('fetchPipe (AC3)', () => {
  it('returns the rows of the pipe response and sends the params', async () => {
    serve({ [pipePath]: () => tinybirdRows([{ activityCount: 7 }]) });
    const { request, error } = fakeRequest();

    const rows = await fetchPipe<Row>(request, pipePath, {
      project: 'kubernetes',
      bucketId: 3,
      repos: ['https://github.com/kubernetes/kubernetes'],
      startDate: '2025-06-20 00:00:00',
    });

    expect(rows).toEqual([{ activityCount: 7 }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = callsTo(pipePath)[0]!;
    expect(url.origin).toBe(tinybirdHost);
    expect(url.searchParams.get('project')).toBe('kubernetes');
    expect(url.searchParams.get('bucketId')).toBe('3');
    expect(url.searchParams.get('repos')).toBe('https://github.com/kubernetes/kubernetes');
    expect(url.searchParams.get('startDate')).toBe('2025-06-20 00:00:00');
    expect(error).not.toHaveBeenCalled();
  });

  it('accepts rows that pass the row check', async () => {
    serve({ [pipePath]: () => tinybirdRows([{ activityCount: 1 }, { activityCount: 2 }]) });
    const { request } = fakeRequest();

    const rows = await fetchPipe<Row>(
      request,
      pipePath,
      { bucketId: 3 },
      (row) => typeof row.activityCount === 'number',
    );

    expect(rows).toEqual([{ activityCount: 1 }, { activityCount: 2 }]);
  });

  it('returns an empty list when the pipe has no rows', async () => {
    serve({ [pipePath]: () => tinybirdRows([]) });
    const { request } = fakeRequest();
    expect(await fetchPipe<Row>(request, pipePath, { bucketId: 3 })).toEqual([]);
  });

  const failures: [string, () => Response | Promise<Response>][] = [
    ['a 500', () => new Response(upstreamDetail, { status: 500 })],
    ['a 401', () => new Response(upstreamDetail, { status: 401, statusText: 'Unauthorized' })],
    ['a 429', () => new Response(upstreamDetail, { status: 429 })],
    ['a network error', () => Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`))],
    [
      'a body that is not JSON',
      () => new Response(`<html>${upstreamDetail}</html>`, { status: 200 }),
    ],
    ['a body without data', () => jsonResponse({ detail: upstreamDetail })],
    ['data that is not an array', () => tinybirdRows({ detail: upstreamDetail })],
  ];

  it.each(failures)(
    'maps %s to UpstreamUnavailableError and logs it once',
    async (_label, response) => {
      serve({ [pipePath]: response });
      const { request, error } = fakeRequest();

      const err = await rejectionOf(fetchPipe<Row>(request, pipePath, { bucketId: 3 }));

      expect(err).toBeInstanceOf(UpstreamUnavailableError);
      expect(err).toMatchObject({ statusCode: 503, code: 'upstream_unavailable' });
      expect((err as Error).message).not.toContain(upstreamDetail);
      expect(error).toHaveBeenCalledTimes(1);
      const [context, message] = error.mock.calls[0] as [{ err: unknown }, string];
      expect(context.err).toBeDefined();
      expect(message).toContain(pipePath);
    },
  );

  it('maps a row that fails the row check to UpstreamUnavailableError and logs it once', async () => {
    serve({ [pipePath]: () => tinybirdRows([{ activityCount: 5 }, { detail: upstreamDetail }]) });
    const { request, error } = fakeRequest();

    const err = await rejectionOf(
      fetchPipe<Row>(
        request,
        pipePath,
        { bucketId: 3 },
        (row) => typeof row.activityCount === 'number',
      ),
    );

    expect(err).toBeInstanceOf(UpstreamUnavailableError);
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[1])).toContain(pipePath);
  });
});

describe('withBucket (AC4)', () => {
  beforeEach(() => {
    // The client warns when the bucket lookup finds no row; keep the output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves the bucket once and passes it to the query', async () => {
    serve({ [bucketsPath]: () => tinybirdRows([{ bucketId: 3 }]) });
    const { request, error } = fakeRequest();
    const query = vi.fn(async (bucketId: number) => ({ bucketId, ok: true }));

    const result = await withBucket(request, 'kubernetes', query);

    expect(result).toEqual({ bucketId: 3, ok: true });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(3);
    expect(callsTo(bucketsPath)).toHaveLength(1);
    expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('kubernetes');
    expect(error).not.toHaveBeenCalled();
  });

  it('returns null for a slug without a bucket and never runs the query', async () => {
    serve({ [bucketsPath]: () => tinybirdRows([]) });
    const { request, error } = fakeRequest();
    const query = vi.fn(async () => 'unreachable');

    expect(await withBucket(request, 'no-such-project', query)).toBeNull();
    expect(query).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it.each([
    ['a 500', () => new Response(upstreamDetail, { status: 500 })],
    ['a network error', () => Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`))],
    ['a malformed body', () => tinybirdRows({ detail: upstreamDetail })],
  ])(
    'maps %s on the lookup to UpstreamUnavailableError and logs it once',
    async (_label, response) => {
      serve({ [bucketsPath]: response });
      const { request, error } = fakeRequest();
      const query = vi.fn(async () => 'unreachable');

      const err = await rejectionOf(withBucket(request, 'kubernetes', query));

      expect(err).toBeInstanceOf(UpstreamUnavailableError);
      expect(err).toMatchObject({ statusCode: 503, code: 'upstream_unavailable' });
      expect(query).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(String(error.mock.calls[0]?.[1])).toContain('project_buckets');
    },
  );

  it("leaves the query's own errors alone", async () => {
    serve({ [bucketsPath]: () => tinybirdRows([{ bucketId: 3 }]) });
    const { request, error } = fakeRequest();
    const failure = new Error('reshaping defect');

    const err = await rejectionOf(
      withBucket(request, 'kubernetes', async () => Promise.reject(failure)),
    );

    expect(err).toBe(failure);
    expect(error).not.toHaveBeenCalled();
  });
});

describe('bucket cache wiring (AC5)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('looks a known slug up once per process, then serves it from memory', async () => {
    serve({ [bucketsPath]: () => tinybirdRows([{ bucketId: 3 }]) });
    const { request } = fakeRequest();
    const query = async (bucketId: number) => bucketId;

    expect(await withBucket(request, 'kubernetes', query)).toBe(3);
    expect(await withBucket(request, 'kubernetes', query)).toBe(3);

    expect(callsTo(bucketsPath)).toHaveLength(1);
  });

  it('keeps one entry per slug', async () => {
    serve({
      [bucketsPath]: (url) =>
        tinybirdRows([{ bucketId: url.searchParams.get('project') === 'kubernetes' ? 3 : 8 }]),
    });
    const { request } = fakeRequest();
    const query = async (bucketId: number) => bucketId;

    expect(await withBucket(request, 'kubernetes', query)).toBe(3);
    expect(await withBucket(request, 'envoy', query)).toBe(8);
    expect(await withBucket(request, 'kubernetes', query)).toBe(3);

    expect(callsTo(bucketsPath)).toHaveLength(2);
  });

  it('does not remember a slug without a bucket', async () => {
    serve({ [bucketsPath]: () => tinybirdRows([]) });
    const { request } = fakeRequest();
    const query = async () => 'unreachable';

    expect(await withBucket(request, 'no-such-project', query)).toBeNull();
    expect(await withBucket(request, 'no-such-project', query)).toBeNull();

    expect(callsTo(bucketsPath)).toHaveLength(2);
  });

  it('clearAllBucketCaches forces the next request to look the slug up again', async () => {
    serve({ [bucketsPath]: () => tinybirdRows([{ bucketId: 3 }]) });
    const { request } = fakeRequest();
    const query = async (bucketId: number) => bucketId;

    await withBucket(request, 'kubernetes', query);
    await getTinybirdClient().clearAllBucketCaches();
    await withBucket(request, 'kubernetes', query);

    expect(callsTo(bucketsPath)).toHaveLength(2);
  });
});

describe('createInMemoryBucketCache (AC5)', () => {
  it('returns null for a key it has never seen', async () => {
    const cache = createInMemoryBucketCache();
    expect(await cache.getItem('project_bucket:kubernetes')).toBeNull();
  });

  it('stores and returns a value', async () => {
    const cache = createInMemoryBucketCache();
    await cache.setItem('project_bucket:kubernetes', 3);
    expect(await cache.getItem('project_bucket:kubernetes')).toBe(3);
  });

  it('forgets a removed key', async () => {
    const cache = createInMemoryBucketCache();
    await cache.setItem('project_bucket:kubernetes', 3);
    await cache.removeItem('project_bucket:kubernetes');
    expect(await cache.getItem('project_bucket:kubernetes')).toBeNull();
  });

  it('expires a value after its ttl in seconds', async () => {
    let now = 1_000_000;
    const cache = createInMemoryBucketCache(() => now);
    await cache.setItem('project_bucket:kubernetes', 3, { ttl: 60 });

    now += 59_999;
    expect(await cache.getItem('project_bucket:kubernetes')).toBe(3);
    now += 1;
    expect(await cache.getItem('project_bucket:kubernetes')).toBeNull();
  });

  it('keeps a value without a ttl for the life of the process', async () => {
    let now = 0;
    const cache = createInMemoryBucketCache(() => now);
    await cache.setItem('project_bucket:kubernetes', 3);
    now = Number.MAX_SAFE_INTEGER;
    expect(await cache.getItem('project_bucket:kubernetes')).toBe(3);
  });

  it('lists the live keys under a prefix', async () => {
    let now = 0;
    const cache = createInMemoryBucketCache(() => now);
    await cache.setItem('project_bucket:kubernetes', 3);
    await cache.setItem('project_bucket:envoy', 8, { ttl: 10 });
    await cache.setItem('collection_bucket:cncf', 5);

    expect((await cache.getKeys('project_bucket:')).sort()).toEqual([
      'project_bucket:envoy',
      'project_bucket:kubernetes',
    ]);
    expect(await cache.getKeys('collection_bucket:')).toEqual(['collection_bucket:cncf']);

    now = 10_000;
    expect(await cache.getKeys('project_bucket:')).toEqual(['project_bucket:kubernetes']);
  });
});
