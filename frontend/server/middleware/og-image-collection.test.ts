// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockSendRedirect = vi.fn(async () => {
  // Return successfully without actually modifying response
});
const mockFetchFromTinybird = vi.fn();

// Mock sendRedirect before importing the middleware
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3');
  return {
    ...actual,
    sendRedirect: mockSendRedirect,
  };
});

global.defineEventHandler = vi.fn((handler) => handler);

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

let handler: (event: H3Event) => Promise<void | undefined>;

beforeAll(async () => {
  const module = await import('./og-image-collection');
  handler = module.default;
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchFromTinybird.mockResolvedValue({ data: [{ slug: 'test' }] });
  mockSendRedirect.mockResolvedValue(undefined);
});

function createEvent(path: string): H3Event {
  return {
    path,
    node: { req: {}, res: {} },
  } as unknown as H3Event;
}

describe('og-image-collection', () => {
  it('should skip non-collection OG image paths', async () => {
    const event = createEvent('/__og-image__/image/project/test');

    await handler(event);

    expect(mockFetchFromTinybird).not.toHaveBeenCalled();
  });

  it('should skip non-OG-image paths', async () => {
    const event = createEvent('/api/test');

    await handler(event);

    expect(mockFetchFromTinybird).not.toHaveBeenCalled();
  });

  it('should allow valid collections', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [{ slug: 'valid' }] });
    const event = createEvent('/__og-image__/image/collection/valid-slug/');

    await handler(event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/collections_list.json',
      expect.objectContaining({ slug: 'valid-slug' }),
    );
    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('should redirect on missing collection', async () => {
    mockFetchFromTinybird.mockResolvedValue({ data: [] });
    const event = createEvent('/__og-image__/image/collection/missing/');

    await handler(event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('should redirect on Tinybird errors', async () => {
    mockFetchFromTinybird.mockRejectedValue(new Error('Network error'));
    const event = createEvent('/__og-image__/image/collection/test/');

    await handler(event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('should extract slug from URL path correctly', async () => {
    const event = createEvent('/__og-image__/image/collection/my-collection/extra/path');

    await handler(event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/collections_list.json',
      expect.objectContaining({ slug: 'my-collection' }),
    );
  });

  it('should handle missing slug in path', async () => {
    const event = createEvent('/__og-image__/image/collection/');

    await handler(event);

    expect(mockFetchFromTinybird).not.toHaveBeenCalled();
  });
});
