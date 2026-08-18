// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

const mockSendRedirect = vi.fn(async () => {
  // Return successfully without actually modifying response
});
const mockFetchFromTinybird = vi.fn();
const mockCreateError = vi.fn((error) => error);
const mockSendError = vi.fn();
const mockGetHeader = vi.fn();

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3');
  return {
    ...actual,
    sendRedirect: mockSendRedirect,
  };
});

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = mockCreateError;
global.sendError = mockSendError;
global.getHeader = mockGetHeader;

let handler: (event: H3Event) => Promise<void | undefined>;

beforeAll(async () => {
  const module = await import('./og-image');
  handler = module.default;
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockGetHeader.mockReturnValue('Mozilla/5.0'); // default: not a bot
  mockFetchFromTinybird.mockResolvedValue({ data: [{ slug: 'test' }] });
  mockSendRedirect.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

function createEvent(path: string) {
  const headers: Record<string, string> = {};
  const res = {
    headersSent: false,
    writableEnded: false,
    once: vi.fn(),
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
    writeHead(statusCode: number) {
      return statusCode;
    },
  };
  const event = { path, node: { req: {}, res } } as unknown as H3Event;
  return { event, res, headers };
}

describe('og-image bot rate limiting', () => {
  it('should skip non-OG-image paths', async () => {
    mockGetHeader.mockReturnValue('bingbot');
    const { event } = createEvent('/api/test');

    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();
  });

  it('should skip non-bot user agents', async () => {
    mockGetHeader.mockReturnValue('Mozilla/5.0');
    const { event } = createEvent('/__og-image__/test');

    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();
  });

  it('should allow initial bot request', async () => {
    mockGetHeader.mockReturnValue('unique-bot-' + Math.random());
    const { event } = createEvent('/__og-image__/test1');

    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();
  });

  it('should detect known bot patterns', async () => {
    const botPatterns = ['bingbot', 'googlebot', 'PetalBot'];

    for (const pattern of botPatterns) {
      mockGetHeader.mockReturnValue(pattern);
      const { event } = createEvent('/__og-image__/test');

      await handler(event);

      // First request should pass (not rate limited)
      expect(mockSendError).not.toHaveBeenCalled();
    }
  });

  it('should evict stale entries periodically', async () => {
    mockGetHeader.mockReturnValue('bingbot');
    const { event } = createEvent('/__og-image__/test');
    await handler(event);

    expect(mockSendError).not.toHaveBeenCalled();

    // Fast-forward 15 seconds (past the 10-second eviction interval)
    // and past the 1-second window reset
    vi.advanceTimersByTime(15000);

    const { event: event2 } = createEvent('/__og-image__/test2');
    await handler(event2);

    expect(mockSendError).not.toHaveBeenCalled();
  });
});

describe('og-image cache headers', () => {
  it('skips non-OG-image paths without patching writeHead', async () => {
    const { event, res } = createEvent('/api/test');
    const original = res.writeHead;

    await handler(event);

    expect(res.writeHead).toBe(original);
  });

  it('applies long-term cache on a 200 response', async () => {
    const { event, res, headers } = createEvent('/__og-image__/test');

    await handler(event);
    res.writeHead(200);

    expect(headers['Cache-Control']).toContain('max-age=86400');
    expect(headers['Cache-Control']).toContain('public');
    expect(headers['Vary']).toBe('User-Agent');
  });

  it('applies a short cache on a 302 redirect', async () => {
    const { event, res, headers } = createEvent('/__og-image__/test');

    await handler(event);
    res.writeHead(302);

    expect(headers['Cache-Control']).toContain('max-age=300');
  });

  it('applies no-cache on an error response', async () => {
    const { event, res, headers } = createEvent('/__og-image__/test');

    await handler(event);
    res.writeHead(500);

    expect(headers['Cache-Control']).toBe('no-cache, no-store, must-revalidate');
  });
});

describe('og-image collection existence check', () => {
  it('should skip non-collection OG image paths', async () => {
    const { event } = createEvent('/__og-image__/image/project/test');

    await handler(event);

    expect(mockFetchFromTinybird).not.toHaveBeenCalledWith(
      '/v0/pipes/collections_list.json',
      expect.anything(),
    );
  });

  it('should allow valid collections', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [{ slug: 'valid' }] });
    const { event } = createEvent('/__og-image__/image/collection/valid-slug/');

    await handler(event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/collections_list.json',
      expect.objectContaining({ slug: 'valid-slug' }),
    );
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('should redirect on missing collection', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [] });
    const { event } = createEvent('/__og-image__/image/collection/missing/');

    await handler(event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('should redirect on Tinybird errors', async () => {
    mockFetchFromTinybird.mockRejectedValue(new Error('Network error'));
    const { event } = createEvent('/__og-image__/image/collection/test/');

    await handler(event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('should extract slug from URL path correctly', async () => {
    const { event } = createEvent('/__og-image__/image/collection/my-collection/extra/path');

    await handler(event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/collections_list.json',
      expect.objectContaining({ slug: 'my-collection' }),
    );
  });

  it('should handle missing slug in path', async () => {
    const { event } = createEvent('/__og-image__/image/collection/');

    await handler(event);

    expect(mockFetchFromTinybird).not.toHaveBeenCalled();
  });
});

describe('og-image project existence check', () => {
  it('should allow valid projects', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [{ slug: 'valid' }] });
    const { event } = createEvent('/__og-image__/image/project/valid-slug/');

    await handler(event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/projects_list.json',
      expect.objectContaining({ slug: 'valid-slug', details: true }),
    );
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('should redirect on missing project', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [] });
    const { event } = createEvent('/__og-image__/image/project/missing/');

    await handler(event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('should redirect on Tinybird errors', async () => {
    mockFetchFromTinybird.mockRejectedValue(new Error('Network error'));
    const { event } = createEvent('/__og-image__/image/project/test/');

    await handler(event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });
});

describe('og-image render timeout', () => {
  it('should register finish handler for OG image requests', async () => {
    const { event, res } = createEvent('/__og-image__/test');

    await handler(event);

    expect(res.once).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should send fallback on timeout', async () => {
    const { event } = createEvent('/__og-image__/test');

    void handler(event);
    await vi.advanceTimersByTimeAsync(8000);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('should not send redirect if headers already sent', async () => {
    const { event, res } = createEvent('/__og-image__/test');
    res.headersSent = true;

    void handler(event);
    await vi.advanceTimersByTimeAsync(8000);

    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('should clear timeout when response finishes', async () => {
    const { event, res } = createEvent('/__og-image__/test');
    let finishCallback: (() => void) | undefined;

    (res.once as any).mockImplementation((eventType: string, callback: () => void) => {
      if (eventType === 'finish') {
        finishCallback = callback;
      }
    });

    void handler(event);

    if (finishCallback) {
      finishCallback();
    }

    await vi.advanceTimersByTimeAsync(8000);

    expect(mockSendRedirect).not.toHaveBeenCalled();
  });
});
