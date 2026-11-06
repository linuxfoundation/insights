// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { executePipeInstructions } from '../instructions';
import type { PipeInstructions } from '../types';

const mockOfetch = vi.fn();

vi.mock('ofetch', () => ({
  ofetch: (...args: unknown[]) => mockOfetch(...args),
}));

const rowsByPipe: Record<string, Record<string, unknown>[]> = {
  current: [{ count: 150, startDate: '2025-01-06' }],
  previous: [{ count: 100, startDate: '2024-12-30' }],
};

const formulaInstructions = (formula: string): PipeInstructions => ({
  pipes: [
    { id: 'p1', name: 'current', inputs: {} },
    { id: 'p2', name: 'previous', inputs: {} },
  ],
  output: [
    { type: 'direct', name: 'Count', pipeId: 'p1', sourceColumn: 'count' },
    {
      type: 'formula',
      name: 'Result',
      formula,
      dependencies: [
        { variable: 'b', pipeId: 'p1', sourceColumn: 'count' },
        { variable: 'a', pipeId: 'p2', sourceColumn: 'count' },
      ],
    },
  ],
});

const dateJoinInstructions = (formula: string): PipeInstructions => ({
  pipes: [
    { id: 'p1', name: 'current', inputs: {} },
    { id: 'p2', name: 'previous', inputs: {} },
  ],
  output: [
    { type: 'direct', name: 'Date', pipeId: 'p1', sourceColumn: 'startDate' },
    {
      type: 'formula',
      name: 'Result',
      formula,
      dependencies: [
        { variable: 'b', pipeId: 'p1', sourceColumn: 'count' },
        { variable: 'a', pipeId: 'p2', sourceColumn: 'startDate' },
      ],
    },
  ],
});

const resultFor = async (formula: string, build = formulaInstructions) => {
  const rows = await executePipeInstructions(build(formula));
  return rows[0]?.Result;
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN = 'test-token';
  mockOfetch.mockImplementation((url: string) => {
    const pipe = /\/v0\/pipes\/([^.]+)\.json/.exec(url)?.[1] ?? '';
    return Promise.resolve({ data: rowsByPipe[pipe] ?? [] });
  });
});

describe('executePipeInstructions formula columns', () => {
  it.each([
    ['((b - a) / a) * 100', 50],
    ['b - a', 50],
    ['b / a', 1.5],
    ['(a + b) / 2', 125],
    ['-a + 2 * b', 200],
    ['a * 0.5', 50],
  ])('computes %s from the dependency values', async (formula, expected) => {
    expect(await resultFor(formula)).toBe(expected);
  });

  it.each([
    'a.toFixed(1)',
    'Math.max(a, b)',
    'a; b',
    '[a, b]',
    'a > b ? a : b',
    'unknownName * 2',
    'constructor',
    'a +',
    '',
  ])('returns null for %j, which is not plain arithmetic', async (formula) => {
    expect(await resultFor(formula)).toBeNull();
  });

  it('leaves global state untouched when the formula contains an assignment', async () => {
    const key = '__formulaAssignmentTarget';
    expect(await resultFor(`(globalThis.${key} = 1)`)).toBeNull();
    expect(key in globalThis).toBe(false);
  });

  it('applies the same rules on the date-aligned join path', async () => {
    expect(await resultFor('b * 2', dateJoinInstructions)).toBe(300);
    expect(await resultFor('b.toString()', dateJoinInstructions)).toBeNull();
  });
});
