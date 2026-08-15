// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

const mockSendRedirect = vi.fn(async () => {
  // Return successfully without actually modifying response
});

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3');
  return {
    ...actual,
    sendRedirect: mockSendRedirect,
  };
});

global.defineEventHandler = vi.fn((handler) => handler);

let handler: (event: H3Event) => Promise<void>;

beforeAll(async () => {
  const module = await import('./og-image-timeout');
  handler = module.default;
});

afterEach(() => {
  vi.clearAllTimers();
  vi.clearAllMocks();
});

function createEvent(path: string): H3Event {
  return {
    path,
    node: {
      res: {
        headersSent: false,
        writableEnded: false,
        once: vi.fn(),
      },
    },
  } as unknown as H3Event;
}

describe('og-image-timeout', () => {
  it('should skip non-OG-image paths', async () => {
    const event = createEvent('/api/test');

    await handler(event);

    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('should register finish handler for OG image requests', async () => {
    const event = createEvent('/__og-image__/test');

    await handler(event);

    expect(event.node.res.once).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should send fallback on timeout with fake timers', async () => {
    vi.useFakeTimers();
    mockSendRedirect.mockResolvedValue(undefined);
    const event = createEvent('/__og-image__/test');

    void handler(event);

    vi.advanceTimersByTime(8000);
    await vi.runAllTimersAsync();

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);

    vi.useRealTimers();
  });

  it('should not send redirect if headers already sent', async () => {
    vi.useFakeTimers();
    const event = createEvent('/__og-image__/test');
    event.node.res.headersSent = true;

    void handler(event);

    vi.advanceTimersByTime(8000);
    await vi.runAllTimersAsync();

    expect(mockSendRedirect).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should clear timeout when response finishes', async () => {
    vi.useFakeTimers();
    const event = createEvent('/__og-image__/test');
    let finishCallback: (() => void) | undefined;

    (event.node.res.once as any).mockImplementation((eventType: string, callback: () => void) => {
      if (eventType === 'finish') {
        finishCallback = callback;
      }
    });

    void handler(event);

    if (finishCallback) {
      finishCallback();
    }

    vi.advanceTimersByTime(8000);
    await vi.runAllTimersAsync();

    expect(mockSendRedirect).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
