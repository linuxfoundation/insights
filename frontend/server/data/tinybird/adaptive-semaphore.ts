// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Concurrency limiter for outbound Tinybird GET requests.
 *
 * Caps the number of in-flight requests to `limit` (default 35, configurable via
 * NUXT_TINYBIRD_MAX_CONCURRENT). Excess requests queue up to `maxQueueSize`
 * (default 500, configurable via NUXT_TINYBIRD_MAX_QUEUE_SIZE) with a per-item
 * timeout (default 10s, configurable via NUXT_TINYBIRD_QUEUE_TIMEOUT_MS), returning
 * 503 if the queue is full or a queued request times out.
 *
 * Includes an adaptive backoff mechanism: when Tinybird returns a 429, the effective
 * concurrency limit is halved for 30 seconds to reduce pressure, then auto-recovers.
 */
export class AdaptiveSemaphore {
  private count = 0;
  private effectiveLimit: number;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly recoveryMs = 30_000;
  private readonly backoffFactor = 0.5;
  private readonly minLimit = 5;
  private queue: Array<{
    resolve: () => void;
    reject: (err: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];

  constructor(
    private limit: number,
    private maxQueueSize: number,
  ) {
    this.effectiveLimit = limit;
  }

  reportTinybirdRateLimit(): void {
    const previousLimit = this.effectiveLimit;
    this.effectiveLimit = Math.max(Math.floor(this.limit * this.backoffFactor), this.minLimit);

    console.warn(
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
      console.warn(
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

  acquire(timeoutMs: number): Promise<void> {
    if (this.count >= this.effectiveLimit) {
      console.warn(
        JSON.stringify({
          message: 'tinybird_queue_status',
          active: this.count,
          queued: this.queue.length,
          effectiveLimit: this.effectiveLimit,
          limit: this.limit,
          timestamp: new Date().toISOString(),
        }),
      );
    }
    if (this.count < this.effectiveLimit) {
      this.count++;
      return Promise.resolve();
    }
    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(
        createError({
          statusCode: 503,
          statusMessage: 'Tinybird request queue full — try again shortly',
        }),
      );
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.queue.findIndex((item) => item.resolve === resolve);
        if (idx !== -1) this.queue.splice(idx, 1);
        console.warn(
          JSON.stringify({
            message: 'tinybird_throttle',
            queueDepth: this.queue.length,
            effectiveLimit: this.effectiveLimit,
            limit: this.limit,
            timeoutMs,
            timestamp: new Date().toISOString(),
          }),
        );
        reject(
          createError({
            statusCode: 503,
            statusMessage: 'Tinybird request queue full — try again shortly',
          }),
        );
      }, timeoutMs);
      this.queue.push({ resolve, reject, timer });
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

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      clearTimeout(next.timer);
      next.resolve();
    } else {
      this.count--;
    }
  }
}
