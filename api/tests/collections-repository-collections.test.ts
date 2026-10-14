// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpstreamUnavailableError } from '../src/lib/errors.js';
import { mockFetch, responseFields, useApp, type OpenApiDoc } from './helpers/tinybird.js';

const { listRepositoryCollections } = vi.hoisted(() => ({ listRepositoryCollections: vi.fn() }));
vi.mock('../src/lib/collections-db.js', () => ({ listRepositoryCollections }));

const repoUrl = 'https://github.com/kubernetes/kubernetes';
const route = `/v1-alpha/repositories/collections?url=${encodeURIComponent(repoUrl)}`;
const { get } = useApp();

beforeEach(() => {
  listRepositoryCollections.mockReset();
  listRepositoryCollections.mockResolvedValue([
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

  it('looks the collections up by the repository URL', async () => {
    await get(route);
    expect(listRepositoryCollections).toHaveBeenCalledWith(expect.anything(), repoUrl);
  });

  it('leaves Tinybird alone', async () => {
    await get(route);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('unknown repository and empty membership (AC2)', () => {
  it('answers 404 for an unknown repository', async () => {
    listRepositoryCollections.mockResolvedValue(null);
    const res = await get(route);
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'not_found' });
  });

  it('answers 200 with an empty list for a repository in no public collection', async () => {
    listRepositoryCollections.mockResolvedValue([]);
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [], publicCount: 0 });
  });
});

describe('url parameter (AC3)', () => {
  it('answers 400 when url is missing', async () => {
    const res = await get('/v1-alpha/repositories/collections');
    expect(res.statusCode).toBe(400);
    expect(listRepositoryCollections).not.toHaveBeenCalled();
  });

  it('answers 400 when url is empty', async () => {
    const res = await get('/v1-alpha/repositories/collections?url=');
    expect(res.statusCode).toBe(400);
  });
});

describe('shared route behaviour (AC4)', () => {
  it('sets Cache-Control: private, max-age=0', async () => {
    const res = await get(route);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('answers 503 upstream_unavailable with the header set when Postgres fails', async () => {
    listRepositoryCollections.mockRejectedValue(new UpstreamUnavailableError());
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ code: 'upstream_unavailable' });
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('stays out of /v1', async () => {
    const res = await get(`/v1/repositories/collections?url=${encodeURIComponent(repoUrl)}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('OpenAPI (AC5)', () => {
  it('is tagged Collections, with a required url, a summary, a description and every field required', async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const operation = spec.paths['/v1-alpha/repositories/collections']?.get;
    expect(operation?.tags).toEqual(['Collections']);
    expect(operation?.summary).toBeTruthy();
    expect(operation?.description).toBeTruthy();
    const url = operation?.parameters?.find((p) => p.name === 'url');
    expect(url?.required).toBe(true);
    expect(url?.description).toBeTruthy();
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
