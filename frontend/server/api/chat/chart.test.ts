// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockReadBody = vi.fn();
const mockExecutePipeInstructions = vi.fn();
const mockGetBucketIdForProject = vi.fn();
const mockGenerateChartConfig = vi.fn();

vi.mock('../../../lib/chat/instructions', () => ({
  executePipeInstructions: (...args: unknown[]) => mockExecutePipeInstructions(...args),
}));

vi.mock('../../data/tinybird/bucket-cache', () => ({
  getBucketIdForProject: (...args: unknown[]) => mockGetBucketIdForProject(...args),
}));

vi.mock('../../data/tinybird/tinybird', () => ({
  fetchFromTinybird: vi.fn(),
}));

vi.mock('../../repo/chat.repo', () => ({
  ChatRepository: vi.fn(),
}));

vi.mock('../../../lib/chat/chart/generator', () => ({
  generateChartConfig: (...args: unknown[]) => mockGenerateChartConfig(...args),
  modifyChartConfig: vi.fn(),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);
global.readBody = mockReadBody;

type Handler = (event: H3Event) => Promise<unknown>;

let handler: Handler;

beforeAll(async () => {
  handler = (await import('./chart')).default as unknown as Handler;
});

const event = { context: {} } as unknown as H3Event;

const pipeInstructions = {
  pipes: [{ id: 'p1', name: 'activities_count', inputs: { project: 'k8s' } }],
  output: [{ type: 'direct', name: 'Count', pipeId: 'p1', sourceColumn: 'count' }],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGenerateChartConfig.mockResolvedValue({
    isMetric: false,
    config: { type: 'bar' },
    dataMapping: [],
  });
});

describe('POST /api/chat/chart', () => {
  it('returns 400 for a body with pipe instructions and no results', async () => {
    mockReadBody.mockResolvedValue({ pipeInstructions, userQuery: 'chart this' });

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });

    expect(mockExecutePipeInstructions).not.toHaveBeenCalled();
    expect(mockGetBucketIdForProject).not.toHaveBeenCalled();
    expect(mockGenerateChartConfig).not.toHaveBeenCalled();
  });

  it('builds the chart from the results in the body', async () => {
    const results = [{ Count: 3 }];
    mockReadBody.mockResolvedValue({ results, userQuery: 'chart this' });

    const res = await handler(event);

    expect(mockGenerateChartConfig).toHaveBeenCalledWith(results, 'chart this', undefined);
    expect(res).toMatchObject({ success: true, isModification: false });
    expect(mockExecutePipeInstructions).not.toHaveBeenCalled();
  });

  it('returns 400 when the user query is missing', async () => {
    mockReadBody.mockResolvedValue({ results: [{ Count: 3 }] });

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });
});
