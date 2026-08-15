// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, beforeAll, vi } from 'vitest';

global.defineEventHandler = vi.fn((handler) => handler);

let handler: (event: H3Event) => void;

beforeAll(async () => {
  const module = await import('./og-image-cache-headers');
  handler = module.default;
});

function createEvent(path: string) {
  const headers: Record<string, string> = {};
  const res = {
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
    writeHead(statusCode: number) {
      return statusCode;
    },
  };
  const event = { path, node: { res } } as unknown as H3Event;
  return { event, res, headers };
}

describe('og-image-cache-headers', () => {
  it('skips non-OG-image paths without patching writeHead', () => {
    const { event, res } = createEvent('/api/test');
    const original = res.writeHead;

    handler(event);

    expect(res.writeHead).toBe(original);
  });

  it('applies long-term cache on a 200 response', () => {
    const { event, res, headers } = createEvent('/__og-image__/test');

    handler(event);
    res.writeHead(200);

    expect(headers['Cache-Control']).toContain('max-age=86400');
    expect(headers['Cache-Control']).toContain('public');
    expect(headers['Vary']).toBe('User-Agent');
  });

  it('applies a short cache on a 302 redirect', () => {
    const { event, res, headers } = createEvent('/__og-image__/test');

    handler(event);
    res.writeHead(302);

    expect(headers['Cache-Control']).toContain('max-age=300');
  });

  it('applies no-cache on an error response', () => {
    const { event, res, headers } = createEvent('/__og-image__/test');

    handler(event);
    res.writeHead(500);

    expect(headers['Cache-Control']).toBe('no-cache, no-store, must-revalidate');
  });
});
