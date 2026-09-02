// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { TinybirdQueueFullError, TinybirdQueueTimeoutError } from './errors.js';
import type { TinybirdLogger } from './types.js';

/**
 * Concurrency limiter for outbound Tinybird requests.
 *
 * Caps in-flight requests to `limit`. Excess requests queue up to `maxQueueSize`
 * with a per-item timeout, rejecting with 503 when the queue is full or a queued
 * request times out.
 *
 * Includes adaptive backoff: when Tinybird returns 429, the effective concurrency
 * limit is halved for 30 seconds to reduce pressure, then auto-recovers.
 */
export class AdaptiveSemaphore {
  private count = 0;

  /**
   * The concurrency ceiling currently in force. Starts equal to `limit`.
   * On 429, reportTinybirdRateLimit() lowers it so active requests drain and
   * pressure on Tinybird decreases. After recoveryMs it restores to `limit`.
   */
  private effectiveLimit: number;

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
  ) {
    this.effectiveLimit = limit;
    setInterval(() => {
      this.logger.warn(
        JSON.stringify({
          message: 'tinybird_queue_status',
          active: this.count,
          queued: this.queue.length,
          effectiveLimit: this.effectiveLimit,
          limit: this.limit,
          timestamp: new Date().toISOString(),
        }),
      );
    }, this.statusLogIntervalMs).unref();
  }

  reportTinybirdRateLimit(): void {
    const previousLimit = this.effectiveLimit;
    this.effectiveLimit = Math.max(Math.floor(this.limit * this.backoffFactor), this.minLimit);

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
      this.effectiveLimit = this.limit;
      this.recoveryTimer = null;
      this.logger.warn(
        JSON.stringify({
          message: 'tinybird_adaptive_throttle',
          event: 'recovery',
          restoredLimit: this.limit,
          active: this.count,
          queued: this.queue.length,
          timestamp: new Date().toISOString(),
        }),
      );
    }, this.recoveryMs);
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
