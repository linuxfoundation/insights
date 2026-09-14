// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Error, H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

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

let ogImageErrorHandler: (error: H3Error, event: H3Event) => Promise<void>;

beforeAll(async () => {
  const module = await import('./og-image-error-handler');
  ogImageErrorHandler = module.default;
});

function createEvent(path: string) {
  return { path } as H3Event;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ogImageErrorHandler', () => {
  it('does nothing for paths outside /_og/', async () => {
    const event = createEvent('/api/projects');

    await ogImageErrorHandler(new Error('boom') as H3Error, event);

    expect(mockSendRedirect).not.toHaveBeenCalled();
  });

  it('redirects /_og/ requests to the fallback image on render error', async () => {
    // fails before fix: the old code registered this logic via an unawaited
    // Nitro 'error' hook, so Nitro's built-in 500 response always won the race
    // and this redirect never happened before the response was sent.
    const event = createEvent('/_og/d/c_project,p_abc.png');

    await ogImageErrorHandler(new Error('satori render failed') as H3Error, event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });

  it('still redirects on a timeout-flavored error', async () => {
    const event = createEvent('/_og/d/c_project,p_abc.png');

    await ogImageErrorHandler(new Error('AbortError: render timeout') as H3Error, event);

    expect(mockSendRedirect).toHaveBeenCalledWith(event, '/og-image.png', 302);
  });
});
