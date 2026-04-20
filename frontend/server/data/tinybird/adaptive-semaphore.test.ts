// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdaptiveSemaphore } from './adaptive-semaphore';

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

    it('rejects with 503 when queue is full', async () => {
      const sem = new AdaptiveSemaphore(1, 1);
      await sem.acquire(5000);
      sem.acquire(5000); // fills queue (1 item)

      await expect(sem.acquire(5000)).rejects.toMatchObject({
        statusCode: 503,
        statusMessage: expect.stringContaining('queue full'),
      });

      // cleanup
      sem.release();
    });

    it('rejects with 503 on queue timeout', async () => {
      const sem = new AdaptiveSemaphore(1, 10);
      await sem.acquire(1000);

      const promise = sem.acquire(100);
      vi.advanceTimersByTime(101);

      await expect(promise).rejects.toMatchObject({
        statusCode: 503,
        statusMessage: expect.stringContaining('timeout'),
      });
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
});
