// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_LATENCY_MONITOR_OPTIONS, LatencyMonitor } from '../src/latency-monitor.js';

const WINDOW_MS = DEFAULT_LATENCY_MONITOR_OPTIONS.windowMs;

describe('LatencyMonitor', () => {
  let now: number;
  let monitor: LatencyMonitor;

  beforeEach(() => {
    now = 0;
    monitor = new LatencyMonitor(
      { ...DEFAULT_LATENCY_MONITOR_OPTIONS, warmupWindows: 3 },
      () => now,
    );
  });

  /** Feeds whole windows of samples and returns the ratio reported as each window closed. */
  function runWindows(
    windows: number,
    latencyMs: number,
    options: { samplesPerWindow?: number; learnBaseline?: boolean } = {},
  ): (number | null)[] {
    const { samplesPerWindow = 60, learnBaseline = true } = options;
    const ratios: (number | null)[] = [];
    for (let w = 0; w < windows; w++) {
      for (let i = 0; i < samplesPerWindow; i++) {
        const ratio = monitor.record(latencyMs, learnBaseline);
        if (i === 0) ratios.push(ratio);
      }
      now += WINDOW_MS;
    }
    return ratios;
  }

  it('reports nothing until the warm-up windows have closed', () => {
    const ratios = runWindows(5, 300);

    expect(ratios.slice(0, 4)).toEqual([null, null, null, null]);
    expect(ratios[4]).toBeCloseTo(1);
  });

  it('reports a ratio near 1 while latency is steady', () => {
    const ratios = runWindows(40, 300);

    expect(ratios.at(-1)).toBeCloseTo(1);
  });

  it('uses the p90 of each window so a few slow queries do not register as pressure', () => {
    runWindows(40, 300);
    for (let w = 0; w < 20; w++) {
      for (let i = 0; i < 60; i++) monitor.record(i < 3 ? 5_000 : 300);
      now += WINDOW_MS;
    }

    expect(monitor.record(300)).toBeCloseTo(1);
  });

  it('reports rising pressure within a few minutes of a sustained slowdown', () => {
    runWindows(360, 300);
    const ratios = runWindows(20, 480);

    expect(ratios.at(-1)).toBeGreaterThan(1.4);
  });

  it('smooths a single slow window instead of reacting to it', () => {
    runWindows(360, 300);
    runWindows(1, 900);

    expect(monitor.record(300)).toBeLessThan(1.4);
  });

  it('keeps reporting pressure through a long overload while the baseline is frozen', () => {
    runWindows(360, 300);
    const ratios = runWindows(6 * 360, 450, { learnBaseline: false });

    expect(ratios.at(-1)).toBeCloseTo(1.5);
    expect(monitor.getBaselineMs()).toBeCloseTo(300);
  });

  it('skips windows with too few samples to estimate a p90', () => {
    runWindows(360, 300);
    const ratios = runWindows(3, 900, { samplesPerWindow: 10 });

    expect(ratios.slice(1)).toEqual([null, null]);
    expect(monitor.getSmoothedMs()).toBeCloseTo(300);
  });

  it('bases a fresh process on the running mean of its first windows', () => {
    runWindows(1, 600);
    runWindows(3, 200);
    monitor.record(200);

    expect(monitor.getBaselineMs()).toBeCloseTo((600 + 200 * 3) / 4);
  });
});
