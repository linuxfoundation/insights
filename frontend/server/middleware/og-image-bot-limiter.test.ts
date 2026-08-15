// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll } from 'vitest';

const mockCreateError = vi.fn((error) => error);
const mockSendError = vi.fn();

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = mockCreateError;
global.sendError = mockSendError;
global.getHeader = vi.fn();

let handler: (event: H3Event) => Promise<void | undefined>;

beforeAll(async () => {
  const module = await import('./og-image-bot-limiter');
  handler = module.default;
});

function createEvent(path: string): H3Event {
  return {
    path,
    node: { req: {}, res: {} },
  } as unknown as H3Event;
}

describe('og-image-bot-limiter', () => {
  it('should skip non-OG-image paths', async () => {
    (global.getHeader as any).mockReturnValue('bingbot');
    const event = createEvent('/api/test');

    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();
  });

  it('should skip non-bot user agents', async () => {
    (global.getHeader as any).mockReturnValue('Mozilla/5.0');
    const event = createEvent('/__og-image__/test');

    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();
  });

  it('should allow initial bot request', async () => {
    vi.clearAllMocks();
    (global.getHeader as any).mockReturnValue('unique-bot-' + Math.random());
    const event = createEvent('/__og-image__/test1');

    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();
  });

  it('should detect known bot patterns', async () => {
    const botPatterns = ['bingbot', 'googlebot', 'PetalBot'];

    for (const pattern of botPatterns) {
      vi.clearAllMocks();
      (global.getHeader as any).mockReturnValue(pattern);
      const event = createEvent('/__og-image__/test');

      await handler(event);

      // First request should pass (not rate limited)
      expect(mockSendError).not.toHaveBeenCalled();
    }
  });

  it('should evict stale entries periodically', async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    (global.getHeader as any).mockReturnValue('bingbot');

    const event = createEvent('/__og-image__/test');
    await handler(event);

    // Should not have called sendError for first request
    expect(mockSendError).not.toHaveBeenCalled();

    // Fast-forward 15 seconds (past the 10-second eviction interval)
    // and past the 1-second window reset
    vi.advanceTimersByTime(15000);

    // After eviction, the entry should be removed from tracking
    // So a new request from the same bot should not hit the rate limit
    vi.clearAllMocks();
    const event2 = createEvent('/__og-image__/test2');
    await handler(event2);

    expect(mockSendError).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
