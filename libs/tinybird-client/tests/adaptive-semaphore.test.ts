// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdaptiveSemaphore } from '../src/adaptive-semaphore.js';
import { TinybirdQueueFullError, TinybirdQueueTimeoutError } from '../src/errors.js';
import type { LatencyBackoffOptions } from '../src/types.js';

const FAST_LATENCY_BACKOFF: LatencyBackoffOptions = {
  windowMs: 1_000,
  minSamplesPerWindow: 1,
  warmupWindows: 1,
  smoothingTimeConstantMs: 1,
};

/** Reports one latency sample per window; a window's effect lands when the next one opens. */
function latencyWindows(sem: AdaptiveSemaphore, latencyMs: number, windows: number) {
  for (let i = 0; i < windows; i++) {
    sem.reportTinybirdLatency(latencyMs);
    vi.advanceTimersByTime(1_000);
  }
}

describe('AdaptiveSemaphore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('acquire()', () => {
    it('returns false when a slot is immediately available', async () => {
      const sem = new AdaptiveSemaphore(2, 10);
      expect(await sem.acquire(1000)).toBe(false);
    });

    it('returns true when the request was queued', async () => {
      const sem = new AdaptiveSemaphore(1, 10);
      await sem.acquire(5000);

      const promise = sem.acquire(5000);
      sem.release();

      expect(await promise).toBe(true);
    });

    it('blocks when all slots are taken', async () => {
      const sem = new AdaptiveSemaphore(2, 10);
      await sem.acquire(1000);
      await sem.acquire(1000);

      let resolved = false;
      const promise = sem.acquire(5000).then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(resolved).toBe(false);

      sem.release();
      await promise;
      expect(resolved).toBe(true);
    });

    it('rejects with TinybirdQueueFullError when queue is full', async () => {
      const sem = new AdaptiveSemaphore(1, 1);
      await sem.acquire(5000);
      sem.acquire(5000); // fills queue

      await expect(sem.acquire(5000)).rejects.toBeInstanceOf(TinybirdQueueFullError);
      await expect(sem.acquire(5000)).rejects.toMatchObject({ statusCode: 503 });

      // cleanup
      sem.release();
    });

    it('rejects with TinybirdQueueTimeoutError on queue timeout', async () => {
      const sem = new AdaptiveSemaphore(1, 10);
      await sem.acquire(1000);

      const promise = sem.acquire(100);
      vi.advanceTimersByTime(101);

      await expect(promise).rejects.toBeInstanceOf(TinybirdQueueTimeoutError);
      await expect(promise).rejects.toMatchObject({ statusCode: 503 });
    });
  });

  describe('release()', () => {
    it('serves queued waiters in FIFO order', async () => {
      const sem = new AdaptiveSemaphore(1, 10);
      await sem.acquire(5000);

      const order: number[] = [];
      const p1 = sem.acquire(5000).then(() => order.push(1));
      const p2 = sem.acquire(5000).then(() => order.push(2));

      sem.release();
      await p1;
      sem.release();
      await p2;

      expect(order).toEqual([1, 2]);
    });

    it('drains count during backoff instead of serving queue', async () => {
      const sem = new AdaptiveSemaphore(10, 10);
      for (let i = 0; i < 10; i++) await sem.acquire(5000);

      let queuedResolved = false;
      const queuedPromise = sem.acquire(5000).then(() => {
        queuedResolved = true;
      });

      // Trigger backoff: effectiveLimit drops to 5
      sem.reportTinybirdRateLimit();
      expect(sem.getEffectiveLimit()).toBe(5);

      // Release 5 times: count drains 10 → 5, queue NOT served
      for (let i = 0; i < 5; i++) sem.release();
      await vi.advanceTimersByTimeAsync(0);
      expect(sem.getActive()).toBe(5);
      expect(queuedResolved).toBe(false);

      // Next release: count(5) <= effectiveLimit(5), queue served
      sem.release();
      await queuedPromise;
      expect(queuedResolved).toBe(true);
    });
  });

  describe('reportTinybirdRateLimit()', () => {
    it('halves the effective limit', () => {
      const sem = new AdaptiveSemaphore(20, 10);
      sem.reportTinybirdRateLimit();
      expect(sem.getEffectiveLimit()).toBe(10);
    });

    it('does not go below minLimit (5)', () => {
      const sem = new AdaptiveSemaphore(8, 10);
      sem.reportTinybirdRateLimit();
      expect(sem.getEffectiveLimit()).toBe(5);
    });

    it('recovers after 30 seconds', () => {
      const sem = new AdaptiveSemaphore(20, 10);
      sem.reportTinybirdRateLimit();
      expect(sem.getEffectiveLimit()).toBe(10);

      vi.advanceTimersByTime(30_000);
      expect(sem.getEffectiveLimit()).toBe(20);
    });
  });

  describe('reportTinybirdLatency()', () => {
    it('shrinks the limit by a quarter per slow window, down to half the configured limit', () => {
      const sem = new AdaptiveSemaphore(20, 10, console, FAST_LATENCY_BACKOFF);
      latencyWindows(sem, 100, 5);

      latencyWindows(sem, 300, 2);
      expect(sem.getEffectiveLimit()).toBe(15);

      latencyWindows(sem, 300, 5);
      expect(sem.getEffectiveLimit()).toBe(10);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"latency_backoff"'));
    });

    it('grows the limit back one slot per healthy window', () => {
      const sem = new AdaptiveSemaphore(20, 10, console, FAST_LATENCY_BACKOFF);
      latencyWindows(sem, 100, 5);
      latencyWindows(sem, 300, 6);

      latencyWindows(sem, 100, 2);
      expect(sem.getEffectiveLimit()).toBe(11);

      latencyWindows(sem, 100, 9);
      expect(sem.getEffectiveLimit()).toBe(20);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"latency_recovery"'));
    });

    it('holds the limit while latency sits between the recovery and backoff ratios', () => {
      const sem = new AdaptiveSemaphore(20, 10, console, FAST_LATENCY_BACKOFF);
      latencyWindows(sem, 100, 5);
      latencyWindows(sem, 300, 2);
      latencyWindows(sem, 170, 1);
      const backedOffLimit = sem.getEffectiveLimit();

      latencyWindows(sem, 170, 4);
      expect(sem.getEffectiveLimit()).toBe(backedOffLimit);
    });

    it('serves queued requests as soon as the limit grows back', async () => {
      const sem = new AdaptiveSemaphore(4, 10, console, { ...FAST_LATENCY_BACKOFF, floor: 2 });
      latencyWindows(sem, 100, 5);
      latencyWindows(sem, 300, 4);
      expect(sem.getEffectiveLimit()).toBe(2);

      await sem.acquire(60_000);
      await sem.acquire(60_000);
      let queuedResolved = false;
      const queuedPromise = sem.acquire(60_000).then(() => {
        queuedResolved = true;
      });
      await vi.advanceTimersByTimeAsync(0);
      expect(queuedResolved).toBe(false);

      latencyWindows(sem, 100, 2);
      await queuedPromise;
      expect(queuedResolved).toBe(true);
      expect(sem.getActive()).toBe(3);
    });

    it('applies the lower of the latency and rate-limit ceilings', () => {
      const sem = new AdaptiveSemaphore(20, 10, console, FAST_LATENCY_BACKOFF);
      latencyWindows(sem, 100, 5);
      latencyWindows(sem, 300, 2);
      expect(sem.getEffectiveLimit()).toBe(15);

      sem.reportTinybirdRateLimit();
      expect(sem.getEffectiveLimit()).toBe(10);

      vi.advanceTimersByTime(30_000);
      expect(sem.getEffectiveLimit()).toBe(15);
    });

    it('keeps the configured limit when latency backoff is disabled', () => {
      const sem = new AdaptiveSemaphore(20, 10, console, false);
      latencyWindows(sem, 100, 5);
      latencyWindows(sem, 300, 10);

      expect(sem.getEffectiveLimit()).toBe(20);
    });

    it('defaults the floor to half the limit below the 429 minimum', () => {
      const sem = new AdaptiveSemaphore(8, 10, console, FAST_LATENCY_BACKOFF);
      latencyWindows(sem, 100, 5);
      latencyWindows(sem, 300, 5);
      expect(sem.getEffectiveLimit()).toBe(4);
    });
  });
});
