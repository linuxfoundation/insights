// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

import { setResponseHeader, setResponseStatus, type H3Event } from 'h3';

import { verifyOrRefreshOidcToken } from '../utils/auth-refresh';

const BASE = '/docs/api';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const isFile = async (path: string) => (await stat(path).catch(() => null))?.isFile() ?? false;

// Returns the file to serve, or null when the path is unknown or escapes the docs dir.
async function resolveDocsFile(docsDir: string, pathname: string): Promise<string | null> {
  let relative: string;
  try {
    relative = decodeURIComponent(pathname.slice(BASE.length)) || '/';
  } catch {
    return null;
  }
  if (relative.endsWith('/')) relative += 'index.html';

  const file = resolve(docsDir, `.${relative}`);
  if (!file.startsWith(docsDir + sep)) return null;

  if (await isFile(file)) return file;
  if (!extname(file) && (await isFile(`${file}.html`))) return `${file}.html`;
  if (await isFile(join(file, 'index.html'))) return join(file, 'index.html');
  return null;
}

async function sendFile(event: H3Event, file: string, status = 200) {
  setResponseStatus(event, status);
  setResponseHeader(
    event,
    'content-type',
    CONTENT_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
  );
  return readFile(file);
}

// sendRedirect echoes the target URL into an HTML body, so the redirect is set by hand to keep it empty.
function redirect(event: H3Event, location: string) {
  setResponseStatus(event, 302);
  setResponseHeader(event, 'location', location);
  return '';
}

// Served here instead of public/ because Nitro serves public/ before any middleware can check the session.
export default defineEventHandler(async (event) => {
  const [pathname = ''] = event.path.split('?');
  if (pathname !== BASE && !pathname.startsWith(`${BASE}/`)) return;

  // The catch-all redis cache must never hand gated docs to another visitor (see setup/caching.ts).
  setResponseHeader(event, 'cache-control', 'private, no-store');

  if (!(await verifyOrRefreshOidcToken(event))) {
    return redirect(event, `/api/auth/login?redirectTo=${encodeURIComponent(event.path)}`);
  }

  // VitePress resolves pages against its /docs/api/ base, so the bare path moves under it, query included.
  if (pathname === BASE) return redirect(event, `${BASE}/${event.path.slice(BASE.length)}`);

  const docsDir = resolve(useRuntimeConfig(event).apiDocsDir);
  const file = await resolveDocsFile(docsDir, pathname);
  if (file) return sendFile(event, file);

  const notFoundPage = join(docsDir, '404.html');
  if (await isFile(notFoundPage)) return sendFile(event, notFoundPage, 404);
  setResponseStatus(event, 404);
  return 'Not found';
});
