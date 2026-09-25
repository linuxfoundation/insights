// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Static } from '@sinclair/typebox';

import { PaginationQuery } from '../schemas/common.js';

export interface Page {
  pageSize: number;
  offset: number;
}

export class InvalidCursorError extends Error {
  readonly statusCode = 400;
  readonly code = 'invalid_request';

  constructor() {
    super('cursor must be a nextCursor value from a previous response');
    this.name = 'InvalidCursorError';
  }
}

const defaultPageSize: number = PaginationQuery.properties.pageSize.default;

// The ranking pipes read offset as an Int32, so a larger one would fail in Tinybird.
const maxOffset = 2 ** 31 - 1;

// Ranking pipes page by position, so the cursor holds a row offset rather than ADR-0011's keyset.
const encodeCursor = (offset: number) => Buffer.from(String(offset)).toString('base64url');

function decodeCursor(cursor: string): number {
  const text = Buffer.from(cursor, 'base64url').toString();
  const offset = Number(text);
  // Buffer skips characters outside the alphabet, so the round trip accepts only the canonical
  // encoding of an offset.
  if (!/^\d+$/.test(text) || offset > maxOffset || encodeCursor(offset) !== cursor) {
    throw new InvalidCursorError();
  }
  return offset;
}

export function requestedPage({
  cursor,
  pageSize = defaultPageSize,
}: Static<typeof PaginationQuery>): Page {
  return { pageSize, offset: cursor === undefined ? 0 : decodeCursor(cursor) };
}

// The extra row only shows whether a next page exists.
export const pipeWindow = ({ pageSize, offset }: Page) => ({ limit: pageSize + 1, offset });

function toPageShape<T>(rows: T[], { pageSize, offset }: Page, hasNext: boolean) {
  const nextOffset = offset + pageSize;
  return {
    data: rows.slice(0, pageSize),
    pageSize,
    nextCursor: hasNext && nextOffset <= maxOffset ? encodeCursor(nextOffset) : null,
  };
}

// Rows must come in the order the pipe applied LIMIT and OFFSET in, so the extra row is the last
// one. Re-sort first when a pipe's final ORDER BY differs.
export const toPage = <T>(rows: T[], page: Page) =>
  toPageShape(rows, page, rows.length > page.pageSize);

// For pipes that page by page number. A cursor saved under another pageSize falls inside a page,
// so the two pages around it are read and `skip` rows dropped from the front.
export function pipePages({ pageSize, offset }: Page) {
  const first = Math.floor(offset / pageSize);
  const skip = offset - first * pageSize;
  return { pages: skip === 0 ? [first] : [first, first + 1], skip };
}

// For pipes that report a total instead of taking an extra row. Rows start at the page offset.
export const toCountedPage = <T>(rows: T[], page: Page, total: number) =>
  toPageShape(rows, page, page.offset + page.pageSize < total);
