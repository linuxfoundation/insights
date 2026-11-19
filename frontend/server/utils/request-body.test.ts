// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { PassThrough } from 'node:stream';

import type { H3Event } from 'h3';
import { describe, it, expect } from 'vitest';

import { MAX_RETURN_TO_LENGTH, readBoundedJsonBody, readReturnTo } from './request-body';

function eventFor(req: PassThrough, method = 'POST'): H3Event {
  return { method, node: { req } } as unknown as H3Event;
}

function writeInChunks(req: PassThrough, body: string, end = true) {
  const bytes = Buffer.from(body);
  for (let i = 0; i < bytes.length; i += 1024) req.write(bytes.subarray(i, i + 1024));
  if (end) req.end();
}

describe('readBoundedJsonBody', () => {
  it('parses a JSON body within the limit', async () => {
    const req = new PassThrough();
    const result = readBoundedJsonBody(eventFor(req), 4096);
    writeInChunks(req, '{"returnTo":"/project/k8s"}');
    expect(await result).toEqual({ returnTo: '/project/k8s' });
  });

  it('returns undefined when the body is larger than the limit', async () => {
    const req = new PassThrough();
    const result = readBoundedJsonBody(eventFor(req), 4096);
    writeInChunks(req, JSON.stringify({ returnTo: 'a'.repeat(64 * 1024) }), false);
    expect(await result).toBeUndefined();
  });

  it('keeps draining the request after an oversized body without throwing', async () => {
    const req = new PassThrough();
    const result = readBoundedJsonBody(eventFor(req), 4096);
    writeInChunks(req, 'a'.repeat(8 * 1024), false);
    expect(await result).toBeUndefined();

    expect(req.listenerCount('data')).toBe(0);
    expect(req.listenerCount('end')).toBe(0);
    const ended = new Promise((resolve) => req.once('end', resolve));
    expect(() => writeInChunks(req, 'b'.repeat(8 * 1024))).not.toThrow();
    await ended;
  });

  it('returns undefined for malformed JSON', async () => {
    const req = new PassThrough();
    const result = readBoundedJsonBody(eventFor(req), 4096);
    writeInChunks(req, '{not json');
    expect(await result).toBeUndefined();
  });

  it('returns undefined when the body was already read', async () => {
    const req = new PassThrough();
    req.end('{"returnTo":"/x"}');
    req.resume();
    await new Promise((resolve) => req.once('end', resolve));
    expect(await readBoundedJsonBody(eventFor(req), 4096)).toBeUndefined();
  });

  it('returns undefined for methods without a body', async () => {
    expect(await readBoundedJsonBody(eventFor(new PassThrough(), 'GET'), 4096)).toBeUndefined();
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
