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
  /**
   * How many requests are actively running right now (holding a slot).
   * Incremented by acquire() when a slot is granted immediately.
   * Decremented by release() when a slot is freed with no queued waiter,
   * or when backoff is active and we are draining count down to effectiveLimit.
   *
   * Invariant under normal operation: count <= effectiveLimit.
   * During backoff, count may temporarily exceed effectiveLimit — those extra
   * active requests finish naturally and each release() drains count toward
   * the new lower ceiling without serving the queue.
   */
  private count = 0;

  /**
   * The concurrency ceiling currently in force. Compared against count on
   * every acquire() and release() to decide whether to grant/transfer a slot.
   *
   * Starts equal to `limit`. When Tinybird responds with 429,
   * reportTinybirdRateLimit() lowers it (e.g. 35 → 17) so that in-flight
   * requests drain and pressure on Tinybird decreases. After recoveryMs the
   * ceiling is restored to `limit`.
   *
   *   acquire(): grants slot immediately if count < effectiveLimit; else queues.
   *   release(): transfers slot to next waiter only if count <= effectiveLimit;
   *              otherwise just decrements count (backoff drain).
   */
  private effectiveLimit: number;

  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly recoveryMs = 30_000;
  private readonly backoffFactor = 0.5;
  private readonly minLimit = 5;
  private readonly statusLogIntervalMs = 8_000;

  /**
   * Waiters that could not get a slot immediately. Each entry holds the
   * Promise callbacks for the blocked acquire() call plus a timeout timer
   * that rejects it with 503 if it waits longer than QUEUE_TIMEOUT_MS.
   * Entries are served FIFO by release() — but only when count <= effectiveLimit,
   * so the queue is paused during backoff until active requests drain down.
   */
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
    setInterval(() => {
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
    }, this.statusLogIntervalMs).unref();
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
            statusMessage: 'Tinybird request queue timeout — try again shortly',
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

  /**
   * Called when a request finishes. Either transfers the freed slot to the next
   * queued waiter, or decrements count if the queue is empty or backoff is active.
   *
   * The effectiveLimit check enforces backoff: if a 429 lowered the ceiling while
   * requests were still running, count will temporarily exceed effectiveLimit.
   * In that state we skip the queue and just decrement, letting active concurrency
   * drain toward the new ceiling one release at a time. Once count falls back to
   * effectiveLimit, queued waiters start being served again.
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
