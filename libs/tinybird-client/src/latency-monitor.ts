// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface LatencyMonitorOptions {
  windowMs: number;
  minSamplesPerWindow: number;
  warmupWindows: number;
  smoothingTimeConstantMs: number;
  baselineTimeConstantMs: number;
}

export const DEFAULT_LATENCY_MONITOR_OPTIONS: LatencyMonitorOptions = {
  windowMs: 10_000,
  minSamplesPerWindow: 50,
  warmupWindows: 30,
  smoothingTimeConstantMs: 60_000,
  baselineTimeConstantMs: 24 * 60 * 60_000,
};

const LATENCY_PERCENTILE = 0.9;
const MAX_SAMPLES_PER_WINDOW = 10_000;

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];
}

function decayWeight(elapsedMs: number, timeConstantMs: number): number {
  return 1 - Math.exp(-elapsedMs / timeConstantMs);
}

function moveTowards(current: number | null, target: number, weight: number): number {
  return current === null ? target : current + weight * (target - current);
}

/**
 * Compares recent Tinybird query latency with its own long-run level. Tinybird answers a saturated
 * cluster with slower queries rather than 429s, so rising latency is the earliest overload signal.
 */
export class LatencyMonitor {
  private samples: number[] = [];
  private windowStart: number;
  private lastEvaluation: number;
  private evaluatedWindows = 0;
  private smoothedMs: number | null = null;
  private baselineMs: number | null = null;

  constructor(
    private readonly options: LatencyMonitorOptions = DEFAULT_LATENCY_MONITOR_OPTIONS,
    private readonly now: () => number = Date.now,
  ) {
    this.windowStart = now();
    this.lastEvaluation = this.windowStart;
  }

  /**
   * Returns the smoothed-to-baseline p90 ratio when a window closes after warm-up, else null.
   * Pass learnBaseline=false while backing off so a long overload cannot become the new baseline.
   */
  record(latencyMs: number, learnBaseline = true): number | null {
    const now = this.now();
    const ratio =
      now - this.windowStart >= this.options.windowMs ? this.closeWindow(now, learnBaseline) : null;
    if (this.samples.length < MAX_SAMPLES_PER_WINDOW) {
      this.samples.push(latencyMs);
    }
    return ratio;
  }

  getSmoothedMs(): number | null {
    return this.smoothedMs;
  }

  getBaselineMs(): number | null {
    return this.baselineMs;
  }

  private closeWindow(now: number, learnBaseline: boolean): number | null {
    const samples = this.samples;
    this.samples = [];
    this.windowStart = now;
    if (samples.length < this.options.minSamplesPerWindow) {
      return null;
    }

    const windowP90 = percentile(samples, LATENCY_PERCENTILE);
    const elapsedMs = now - this.lastEvaluation;
    this.lastEvaluation = now;
    this.evaluatedWindows++;

    this.smoothedMs = moveTowards(
      this.smoothedMs,
      windowP90,
      decayWeight(elapsedMs, this.options.smoothingTimeConstantMs),
    );
    if (learnBaseline || this.baselineMs === null) {
      // A plain running mean until the time-based weight takes over keeps a fresh process from
      // anchoring its day-long baseline to whichever window it happened to see first.
      this.baselineMs = moveTowards(
        this.baselineMs,
        windowP90,
        Math.max(
          1 / this.evaluatedWindows,
          decayWeight(elapsedMs, this.options.baselineTimeConstantMs),
        ),
      );
    }

    if (this.evaluatedWindows <= this.options.warmupWindows || this.baselineMs <= 0) {
      return null;
    }
    return this.smoothedMs / this.baselineMs;
  }
}
