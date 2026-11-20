// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFind = vi.fn();
const mockCtor = vi.fn();

vi.mock('~~/server/repo/docsReadiness.repo', () => ({
  DocsReadinessRepository: class {
    constructor(pool: unknown) {
      mockCtor(pool);
    }
    findCorrectionContextBySlug(slug: string) {
      return mockFind(slug);
    }
  },
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);

type Handler = (event: H3Event) => Promise<unknown>;
let handler: Handler;

beforeAll(async () => {
  handler = (await import('./correction-context.get')).default as unknown as Handler;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const pool = { query: vi.fn() };
const eventWith = (cmDbPool: unknown) =>
  ({ context: { params: { slug: 'k8s' }, cmDbPool } }) as unknown as H3Event;

describe('docs correction-context route', () => {
  it('responds 503 when the CDP pool is not attached', async () => {
    await expect(handler(eventWith(undefined))).rejects.toMatchObject({
      statusCode: 503,
      statusMessage: 'Database not available',
    });
    expect(mockCtor).not.toHaveBeenCalled();
  });

  it('responds 404 when the project is not found', async () => {
    mockFind.mockResolvedValue(null);
    await expect(handler(eventWith(pool))).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns the correction context for the slug', async () => {
    const context = { currentDocsUrl: null, candidates: [], override: null };
    mockFind.mockResolvedValue(context);
    expect(await handler(eventWith(pool))).toBe(context);
    expect(mockFind).toHaveBeenCalledWith('k8s');
    expect(mockCtor).toHaveBeenCalledWith(pool);
  });

  it('responds 500 and logs when the query fails', async () => {
    const error = new Error('permission denied for table projectDocOverrides');
    mockFind.mockRejectedValue(error);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const thrown = await handler(eventWith(pool)).catch((e) => e);
    expect(thrown).toMatchObject({ statusCode: 500, statusMessage: 'Internal server error' });
    expect(JSON.stringify(thrown)).not.toContain('permission denied');
    expect(spy).toHaveBeenCalledWith(expect.any(String), error);
    spy.mockRestore();
  });
});
