// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { getTinybirdClient } from '../../src/clients/tinybird.js';

export const tinybirdHost = 'https://tinybird.test';
export const bucketsPath = '/v0/pipes/project_buckets.json';
export const developmentPath = (name: string) => `/v1-alpha/projects/{slug}/development/${name}`;

export const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

export const tinybirdResponse = (rows: unknown[]) =>
  new Response(
    JSON.stringify({
      data: rows,
      meta: [],
      rows: rows.length,
      statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

export const tinybirdError = (status: number, body = 'tinybird internal detail') =>
  new Response(body, { status });

export type PipeResponder = (url: URL) => unknown[] | Response | Promise<unknown[] | Response>;

// The bucket lookup answers `bucket`; every other call goes to `respond`, which returns rows,
// a Response, or throws to act as a network error.
export const tinybirdStub =
  (respond: PipeResponder, bucket: unknown[] = [{ bucketId: 7 }]) =>
  async (input: unknown) => {
    const url = new URL(String(input));
    if (url.pathname === bucketsPath) {
      return tinybirdResponse(bucket);
    }
    const result = await respond(url);
    return result instanceof Response ? result : tinybirdResponse(result);
  };

export const calledUrls = () => mockFetch.mock.calls.map((call) => new URL(String(call[0])));
export const callsTo = (path: string) => calledUrls().filter((url) => url.pathname === path);
export const pipeCalls = () => calledUrls().filter((url) => url.pathname !== bucketsPath);

export function queryString(params: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of [value].flat()) {
      if (item !== undefined) {
        search.append(key, item);
      }
    }
  }
  return search.toString();
}

// One app per test file, a clean fetch mock and bucket cache per test. A file's own beforeEach
// runs after this one, so it sets the default stub.
export function useApp(): { get: (url: string) => Promise<LightMyRequestResponse> } {
  let app: FastifyInstance;

  beforeAll(async () => {
    vi.stubEnv('API_TB_HOST', tinybirdHost);
    vi.stubEnv('API_TB_TOKEN', 'test-token');
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  beforeEach(async () => {
    await getTinybirdClient().clearAllBucketCaches();
    mockFetch.mockReset();
  });

  return { get: (url: string) => app.inject({ method: 'GET', url }) };
}

export interface OpenApiSchema {
  $ref?: string;
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  nullable?: boolean;
  default?: unknown;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

export interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema: OpenApiSchema;
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

export interface OpenApiDoc {
  components?: { schemas?: Record<string, OpenApiSchema> };
  paths: Record<string, { get?: OpenApiOperation }>;
}

// Swagger writes a query property's description on the parameter; older output kept it on the schema.
export const parameterDescription = (param?: OpenApiParameter) =>
  param?.description ?? param?.schema.description;
