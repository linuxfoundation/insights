// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSummary = vi.fn();
const mockHistory = vi.fn();
const mockChecks = vi.fn();

vi.mock('~~/server/data/tinybird/docs-readiness/summary', () => ({
  fetchDocsReadinessSummary: (...args: unknown[]) => mockSummary(...args),
}));
vi.mock('~~/server/data/tinybird/docs-readiness/history', () => ({
  fetchDocsReadinessHistory: (...args: unknown[]) => mockHistory(...args),
}));
vi.mock('~~/server/data/tinybird/docs-readiness/checks', () => ({
  fetchDocsReadinessChecks: (...args: unknown[]) => mockChecks(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);

type Handler = (event: H3Event) => Promise<unknown>;
const handlers: Record<string, Handler> = {};
const fetchers: Record<string, ReturnType<typeof vi.fn>> = {
  summary: mockSummary,
  history: mockHistory,
  checks: mockChecks,
};
const routes = ['summary', 'history', 'checks'];

beforeAll(async () => {
  handlers.summary = (await import('./summary.get')).default as unknown as Handler;
  handlers.history = (await import('./history.get')).default as unknown as Handler;
  handlers.checks = (await import('./checks.get')).default as unknown as Handler;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const event = { context: { params: { slug: 'k8s' } } } as unknown as H3Event;

describe('docs readiness routes', () => {
  it('summary responds with the mapped summary for the slug', async () => {
    const summary = { state: 'scored', score: 77 };
    mockSummary.mockResolvedValue(summary);
    expect(await handlers.summary!(event)).toBe(summary);
    expect(mockSummary).toHaveBeenCalledWith('k8s');
  });

  it('summary responds 404 when the pipe returns no row', async () => {
    mockSummary.mockResolvedValue(null);
    await expect(handlers.summary!(event)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('history responds with the mapped history', async () => {
    const history = { firstEvaluatedMonth: null, months: [] };
    mockHistory.mockResolvedValue(history);
    expect(await handlers.history!(event)).toBe(history);
    expect(mockHistory).toHaveBeenCalledWith('k8s');
  });

  it('checks responds with the mapped checks', async () => {
    const checks = { pagesTested: null, counts: {}, categories: [] };
    mockChecks.mockResolvedValue(checks);
    expect(await handlers.checks!(event)).toBe(checks);
    expect(mockChecks).toHaveBeenCalledWith('k8s');
  });

  it.each(routes)('%s rethrows a 404 from Tinybird', async (route) => {
    const notFound = { statusCode: 404, statusMessage: 'Project not found: k8s' };
    fetchers[route]!.mockRejectedValue(notFound);
    await expect(handlers[route]!(event)).rejects.toBe(notFound);
  });

  it.each(routes)('%s logs and responds 500 on any other error', async (route) => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchers[route]!.mockRejectedValue(new Error('boom'));
    await expect(handlers[route]!(event)).rejects.toMatchObject({ statusCode: 500 });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
