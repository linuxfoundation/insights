// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpstreamUnavailableError } from '../src/lib/errors.js';

const findCollection = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/collections-db.js', () => ({ findCollection }));

import {
  calledUrls,
  mockFetch,
  tinybirdError,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/collections/cloud-native/metrics';
const pipePath = '/v0/pipes/collection_insights_aggregate.json';
const collectionBucketsPath = '/v0/pipes/collection_buckets.json';

const collection = { id: 'c1', projectCount: 3, repositoryCount: 2 };

let rows: unknown[] = [];

// The client resolves a bucket for every `collectionSlug` call before the pipe itself.
const stub = (respond: () => unknown[] | Response) =>
  tinybirdStub((url) => (url.pathname === collectionBucketsPath ? [{ bucketId: 3 }] : respond()));

const { get } = useApp();

beforeEach(() => {
  findCollection.mockReset();
  findCollection.mockResolvedValue(collection);
  rows = [{ projectCount: 3, uniqueContributorCount: 1248, avgHealthScore: 78 }];
  mockFetch.mockImplementation(stub(() => rows));
});

describe('GET /v1-alpha/collections/{slug}/metrics', () => {
  it('combines the Postgres count with the Tinybird aggregate', async () => {
    const response = await get(route);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      projectAndRepositoryCount: 5,
      uniqueContributorCount: 1248,
      avgHealthScore: 78,
    });
  });

  it('looks the collection up by slug and passes it to the pipe with its bucket', async () => {
    await get(route);
    expect(findCollection).toHaveBeenCalledWith(expect.anything(), 'cloud-native');
    const calls = calledUrls().filter((url) => url.pathname === pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('collectionSlug')).toBe('cloud-native');
    expect(calls[0]?.searchParams.get('bucketId')).toBe('3');
  });

  it('returns the Tinybird fields as null when the pipe has no row', async () => {
    rows = [];
    const response = await get(route);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      projectAndRepositoryCount: 5,
      uniqueContributorCount: null,
      avgHealthScore: null,
    });
  });

  it('returns avgHealthScore null when no project has a score to average', async () => {
    rows = [{ projectCount: 3, uniqueContributorCount: 10, avgHealthScore: null }];
    expect((await get(route)).json()).toEqual({
      projectAndRepositoryCount: 5,
      uniqueContributorCount: 10,
      avgHealthScore: null,
    });
  });

  it('counts zero for a collection without members', async () => {
    findCollection.mockResolvedValue({ ...collection, projectCount: 0, repositoryCount: 0 });
    rows = [];
    expect((await get(route)).json().projectAndRepositoryCount).toBe(0);
  });

  it('returns 404 without calling Tinybird for an unknown or private slug', async () => {
    findCollection.mockResolvedValue(null);
    const response = await get(route);
    expect(response.statusCode).toBe(404);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns 503 when the aggregate pipe fails', async () => {
    mockFetch.mockImplementation(stub(() => tinybirdError(500)));
    const response = await get(route);
    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('tinybird internal detail');
    expect(calledUrls().some((url) => url.pathname === pipePath)).toBe(true);
  });

  it('returns 503 when the bucket lookup fails', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(500)));
    expect((await get(route)).statusCode).toBe(503);
  });

  it.each([
    ['a negative contributor count', { uniqueContributorCount: -1, avgHealthScore: 50 }],
    ['a fractional contributor count', { uniqueContributorCount: 1.5, avgHealthScore: 50 }],
    ['a health score above 100', { uniqueContributorCount: 1, avgHealthScore: 101 }],
    ['a negative health score', { uniqueContributorCount: 1, avgHealthScore: -1 }],
    ['a string health score', { uniqueContributorCount: 1, avgHealthScore: '50' }],
  ])('returns 503 for %s', async (_name, row) => {
    rows = [row];
    expect((await get(route)).statusCode).toBe(503);
  });

  it('returns 503 when Postgres fails', async () => {
    findCollection.mockRejectedValue(new UpstreamUnavailableError());
    expect((await get(route)).statusCode).toBe(503);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('is listed in the OpenAPI document under Collections', async () => {
    const doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
    const operation = doc.paths['/v1-alpha/collections/{slug}/metrics']?.get;
    expect(operation?.tags).toEqual(['Collections']);
    expect(operation?.summary).toBeTruthy();
  });
});
