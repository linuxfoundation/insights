// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import { InvalidCursorError, pipeWindow, requestedPage, toPage } from '../src/lib/pagination.js';

const rows = (count: number) => Array.from({ length: count }, (_, index) => ({ index }));
const base64url = (text: string) => Buffer.from(text).toString('base64url');

const errorFor = (cursor: string) => {
  try {
    requestedPage({ cursor });
  } catch (err) {
    return err;
  }
  return undefined;
};

describe('requestedPage', () => {
  it('starts at offset 0 without a cursor', () => {
    expect(requestedPage({ pageSize: 20 })).toEqual({ pageSize: 20, offset: 0 });
  });

  it('defaults pageSize to 50', () => {
    expect(requestedPage({})).toEqual({ pageSize: 50, offset: 0 });
  });

  it('accepts the largest offset the pipes take', () => {
    expect(requestedPage({ cursor: base64url('2147483647') })).toEqual({
      pageSize: 50,
      offset: 2147483647,
    });
  });

  it.each([
    ['an empty cursor', ''],
    ['characters outside base64url', 'NTA!'],
    ['base64 padding', `${base64url('50')}=`],
    ['text that is not an offset', base64url('abc')],
    ['a keyset cursor', base64url('{"k":1,"id":2}')],
    ['a negative offset', base64url('-50')],
    ['a fractional offset', base64url('1.5')],
    ['an offset in exponent notation', base64url('1e3')],
    ['a zero-padded offset', base64url('050')],
    ['an offset past the Int32 range the pipes take', base64url('2147483648')],
  ])('rejects %s with a 400 invalid_request error', (_label, cursor) => {
    const err = errorFor(cursor);
    expect(err).toBeInstanceOf(InvalidCursorError);
    expect(err).toMatchObject({ statusCode: 400, code: 'invalid_request' });
  });
});

describe('pipeWindow', () => {
  it('asks the pipe for one row past the page, from the page offset', () => {
    expect(pipeWindow({ pageSize: 50, offset: 0 })).toEqual({ limit: 51, offset: 0 });
    expect(pipeWindow({ pageSize: 20, offset: 40 })).toEqual({ limit: 21, offset: 40 });
  });
});

describe('toPage', () => {
  it('keeps every row and ends the list when the pipe returns at most pageSize rows', () => {
    expect(toPage(rows(2), { pageSize: 2, offset: 0 })).toEqual({
      data: rows(2),
      pageSize: 2,
      nextCursor: null,
    });
    expect(toPage([], { pageSize: 50, offset: 100 })).toEqual({
      data: [],
      pageSize: 50,
      nextCursor: null,
    });
  });

  it('drops the extra row and returns a base64url cursor', () => {
    const page = toPage(rows(3), { pageSize: 2, offset: 0 });
    expect(page.data).toEqual(rows(2));
    expect(page.pageSize).toBe(2);
    expect(page.nextCursor).toMatch(/^[\w-]+$/);
  });

  it('continues where the page ended when the cursor comes back', () => {
    const first = toPage(rows(3), { pageSize: 2, offset: 0 });
    expect(requestedPage({ cursor: first.nextCursor!, pageSize: 2 })).toEqual({
      pageSize: 2,
      offset: 2,
    });
    const later = toPage(rows(26), { pageSize: 25, offset: 50 });
    expect(requestedPage({ cursor: later.nextCursor!, pageSize: 25 })).toEqual({
      pageSize: 25,
      offset: 75,
    });
  });
});
