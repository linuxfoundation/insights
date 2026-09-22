// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { TinybirdQueueFullError, TinybirdQueueTimeoutError } from './errors.js';
import { DEFAULT_LATENCY_MONITOR_OPTIONS, LatencyMonitor } from './latency-monitor.js';
import type { LatencyBackoffOptions, TinybirdLogger } from './types.js';

const DEFAULT_LATENCY_BACKOFF_RATIO = 1.4;
const DEFAULT_LATENCY_RECOVERY_RATIO = 1.2;
const DEFAULT_LATENCY_DECREASE_FACTOR = 0.75;

/**
 * Concurrency limiter for outbound Tinybird requests.
 *
 * Caps in-flight requests to `limit`. Excess requests queue up to `maxQueueSize`
 * with a per-item timeout, rejecting with 503 when the queue is full or a queued
 * request times out.
 *
 * Includes adaptive backoff: when Tinybird returns 429, the effective concurrency
 * limit is halved for 30 seconds to reduce pressure, then auto-recovers.
 * Latency backoff shrinks the limit while Tinybird queries run slower than their
 * baseline and grows it back one slot per window once they recover.
 */
export class AdaptiveSemaphore {
  private count = 0;

  /**
   * The concurrency ceiling currently in force: the lower of the 429 and latency ceilings.
   * Lowering it lets active requests drain so pressure on Tinybird decreases.
   */
  private effectiveLimit: number;

  private rateLimitCeiling: number;
  private latencyCeiling: number;
  private readonly latencyMonitor: LatencyMonitor | null;
  private readonly latencyFloor: number;
  private readonly latencyBackoffRatio: number;
  private readonly latencyRecoveryRatio: number;
  private readonly latencyDecreaseFactor: number;

  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly recoveryMs = 30_000;
  private readonly backoffFactor = 0.5;
  private readonly minLimit = 5;
  private readonly statusLogIntervalMs = 8_000;

  private queue: Array<{
    resolve: () => void;
    reject: (err: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];

  constructor(
    private limit: number,
    private maxQueueSize: number,
    private logger: TinybirdLogger = console,
    latencyBackoff: LatencyBackoffOptions | false = {},
  ) {
    this.effectiveLimit = limit;
    this.rateLimitCeiling = limit;
    this.latencyCeiling = limit;
    this.latencyMonitor = latencyBackoff
      ? new LatencyMonitor({ ...DEFAULT_LATENCY_MONITOR_OPTIONS, ...latencyBackoff })
      : null;
    const options = latencyBackoff || {};
    this.latencyFloor = Math.max(1, Math.min(limit, options.floor ?? Math.floor(limit / 2)));
    this.latencyBackoffRatio = options.backoffRatio ?? DEFAULT_LATENCY_BACKOFF_RATIO;
    this.latencyRecoveryRatio = options.recoveryRatio ?? DEFAULT_LATENCY_RECOVERY_RATIO;
    this.latencyDecreaseFactor = options.decreaseFactor ?? DEFAULT_LATENCY_DECREASE_FACTOR;

    setInterval(() => {
      this.logger.warn(
        JSON.stringify({
          message: 'tinybird_queue_status',
          active: this.count,
          queued: this.queue.length,
          effectiveLimit: this.effectiveLimit,
          limit: this.limit,
          latencyLimit: this.latencyCeiling,
          latencyP90Ms: this.latencyMonitor?.getSmoothedMs() ?? null,
          latencyBaselineP90Ms: this.latencyMonitor?.getBaselineMs() ?? null,
          timestamp: new Date().toISOString(),
        }),
      );
    }, this.statusLogIntervalMs).unref();
  }

  reportTinybirdRateLimit(): void {
    const previousLimit = this.effectiveLimit;
    this.rateLimitCeiling = Math.min(
      this.limit,
      Math.max(Math.floor(this.limit * this.backoffFactor), this.minLimit),
    );
    this.applyCeilings();

    this.logger.warn(
      JSON.stringify({
        message: 'tinybird_adaptive_throttle',
        event: 'backoff',
        previousLimit,
        newLimit: this.effectiveLimit,
        active: this.count,
        queued: this.queue.length,
        timestamp: new Date().toISOString(),
      }),
    );

    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    this.recoveryTimer = setTimeout(() => {
      this.rateLimitCeiling = this.limit;
      this.applyCeilings();
      this.recoveryTimer = null;
      this.logger.warn(
        JSON.stringify({
          message: 'tinybird_adaptive_throttle',
          event: 'recovery',
          restoredLimit: this.effectiveLimit,
          active: this.count,
          queued: this.queue.length,
          timestamp: new Date().toISOString(),
        }),
      );
    }, this.recoveryMs);
  }

  /**
   * Feeds Tinybird's reported query time for a completed request into latency backoff.
   */
  reportTinybirdLatency(elapsedMs: number): void {
    const ratio =
      this.latencyMonitor?.record(elapsedMs, this.latencyCeiling === this.limit) ?? null;
    if (ratio === null) return;

    const previousLimit = this.effectiveLimit;
    const previousCeiling = this.latencyCeiling;
    if (ratio > this.latencyBackoffRatio) {
      this.latencyCeiling = Math.max(
        this.latencyFloor,
        Math.floor(this.latencyCeiling * this.latencyDecreaseFactor),
      );
    } else if (ratio < this.latencyRecoveryRatio) {
      this.latencyCeiling = Math.min(this.limit, this.latencyCeiling + 1);
    }
    if (this.latencyCeiling === previousCeiling) return;

    this.applyCeilings();
    const backedOff = this.latencyCeiling < previousCeiling;
    if (backedOff || this.latencyCeiling === this.limit) {
      this.logger.warn(
        JSON.stringify({
          message: 'tinybird_adaptive_throttle',
          event: backedOff ? 'latency_backoff' : 'latency_recovery',
          previousLimit,
          newLimit: this.effectiveLimit,
          latencyRatio: Math.round(ratio * 100) / 100,
          active: this.count,
          queued: this.queue.length,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  acquire(timeoutMs: number): Promise<boolean> {
    if (this.count < this.effectiveLimit) {
      this.count++;
      return Promise.resolve(false);
    }
    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(new TinybirdQueueFullError());
    }
    return new Promise<boolean>((resolve, reject) => {
      const entry: (typeof this.queue)[number] = {
        resolve: () => resolve(true),
        reject,
        timer: setTimeout(() => {
          const idx = this.queue.indexOf(entry);
          if (idx !== -1) this.queue.splice(idx, 1);
          this.logger.warn(
            JSON.stringify({
              message: 'tinybird_throttle',
              queueDepth: this.queue.length,
              effectiveLimit: this.effectiveLimit,
              limit: this.limit,
              timeoutMs,
              timestamp: new Date().toISOString(),
            }),
          );
          reject(new TinybirdQueueTimeoutError());
        }, timeoutMs),
      };
      this.queue.push(entry);
    });
  }

  getActive(): number {
    return this.count;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getEffectiveLimit(): number {
    return this.effectiveLimit;
  }

  private applyCeilings(): void {
    const previousLimit = this.effectiveLimit;
    this.effectiveLimit = Math.min(this.rateLimitCeiling, this.latencyCeiling);
    if (this.effectiveLimit > previousLimit) {
      this.serveQueueUpToLimit();
    }
  }

  /**
   * Hands newly freed capacity to queued waiters. release() only transfers one slot per
   * completion, so without this a raised limit would never be used while a queue exists.
   */
  private serveQueueUpToLimit(): void {
    while (this.queue.length > 0 && this.count < this.effectiveLimit) {
      const next = this.queue.shift()!;
      clearTimeout(next.timer);
      this.count++;
      next.resolve();
    }
  }

  /**
   * Called when a request finishes. Transfers the freed slot to the next queued
   * waiter, or decrements count. During backoff (count > effectiveLimit) it just
   * decrements, letting active concurrency drain toward the new ceiling before
   * serving the queue again.
   */
  release(): void {
    if (this.queue.length > 0 && this.count <= this.effectiveLimit) {
      const next = this.queue.shift()!;
      clearTimeout(next.timer);
      next.resolve();
    } else {
      this.count--;
    }
  }
}
