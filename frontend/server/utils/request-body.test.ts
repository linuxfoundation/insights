// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect } from 'vitest';

import { MAX_RETURN_TO_LENGTH, readBoundedJsonBody, readReturnTo } from './request-body';

function eventWithBody(body: string, method = 'POST'): H3Event {
  const bytes = new TextEncoder().encode(body);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Several chunks, so the size check runs while reading rather than on one buffer.
      for (let i = 0; i < bytes.length; i += 1024) controller.enqueue(bytes.slice(i, i + 1024));
      controller.close();
    },
  });
  return { method, _requestBody: stream, node: { req: {} } } as unknown as H3Event;
}

describe('readBoundedJsonBody', () => {
  it('parses a JSON body within the limit', async () => {
    const body = await readBoundedJsonBody(eventWithBody('{"returnTo":"/project/k8s"}'), 4096);
    expect(body).toEqual({ returnTo: '/project/k8s' });
  });

  it('returns undefined when the body is larger than the limit', async () => {
    const big = JSON.stringify({ returnTo: 'a'.repeat(5 * 1024 * 1024) });
    expect(await readBoundedJsonBody(eventWithBody(big), 4096)).toBeUndefined();
  });

  it('returns undefined for malformed JSON', async () => {
    expect(await readBoundedJsonBody(eventWithBody('{not json'), 4096)).toBeUndefined();
  });

  it('returns undefined for methods without a body', async () => {
    expect(await readBoundedJsonBody(eventWithBody('{}', 'GET'), 4096)).toBeUndefined();
  });
});

describe('readReturnTo', () => {
  it('returns a URL-sized string', () => {
    expect(readReturnTo({ returnTo: '/project/k8s' })).toBe('/project/k8s');
  });

  it('ignores values that are not strings', () => {
    expect(readReturnTo({ returnTo: { href: '/x' } })).toBeUndefined();
    expect(readReturnTo({ returnTo: ['/x'] })).toBeUndefined();
    expect(readReturnTo({ returnTo: 42 })).toBeUndefined();
    expect(readReturnTo(undefined)).toBeUndefined();
    expect(readReturnTo('/x')).toBeUndefined();
  });

  it('ignores strings longer than a URL', () => {
    expect(readReturnTo({ returnTo: 'a'.repeat(MAX_RETURN_TO_LENGTH + 1) })).toBeUndefined();
  });
});
