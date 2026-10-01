// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpstreamUnavailableError } from '../src/lib/errors.js';
import { mockFetch, responseFields, useApp, type OpenApiDoc } from './helpers/tinybird.js';

const { listProjectCollections } = vi.hoisted(() => ({ listProjectCollections: vi.fn() }));
vi.mock('../src/lib/collections-db.js', () => ({ listProjectCollections }));

const route = '/v1-alpha/projects/kubernetes/collections';
const { get } = useApp();

beforeEach(() => {
  listProjectCollections.mockReset();
  listProjectCollections.mockResolvedValue([
    { name: 'CNCF', slug: 'cncf', logoUrl: 'https://logos.test/cncf.png' },
    { name: 'Containers', slug: 'containers', logoUrl: '' },
  ]);
});

describe('response (AC1)', () => {
  it('returns the collections as name, slug and logoUrl with the public count', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        { name: 'CNCF', slug: 'cncf', logoUrl: 'https://logos.test/cncf.png' },
        { name: 'Containers', slug: 'containers', logoUrl: null },
      ],
      publicCount: 2,
    });
  });

  it('looks the collections up by the project slug', async () => {
    await get(route);
    expect(listProjectCollections).toHaveBeenCalledWith(expect.anything(), 'kubernetes');
  });

  it('leaves Tinybird alone', async () => {
    await get(route);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('unknown project or no collections (AC2)', () => {
  it('answers 200 with an empty list and a count of 0', async () => {
    listProjectCollections.mockResolvedValue([]);
    const res = await get('/v1-alpha/projects/no-such-project/collections');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [], publicCount: 0 });
  });
});

describe('shared route behaviour (AC3)', () => {
  it('sets Cache-Control: private, max-age=0', async () => {
    const res = await get(route);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('answers 503 upstream_unavailable with the header set when Postgres fails', async () => {
    listProjectCollections.mockRejectedValue(new UpstreamUnavailableError());
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ code: 'upstream_unavailable' });
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('stays out of /v1', async () => {
    const res = await get('/v1/projects/kubernetes/collections');
    expect(res.statusCode).toBe(404);
  });
});

describe('OpenAPI (AC4)', () => {
  it('is tagged Collections, with a summary, a description and every field required', async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const operation = spec.paths['/v1-alpha/projects/{slug}/collections']?.get;
    expect(operation?.tags).toEqual(['Collections']);
    expect(operation?.summary).toBeTruthy();
    expect(operation?.description).toBeTruthy();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const fields = responseFields(spec, schema);
    expect(fields.map((field) => field.path).sort()).toEqual([
      'data',
      'data[].logoUrl',
      'data[].name',
      'data[].slug',
      'publicCount',
    ]);
    expect(fields.filter((field) => !field.required)).toEqual([]);
  });
});
