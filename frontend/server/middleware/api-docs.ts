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

// Served here instead of public/ because Nitro serves public/ before any middleware can check the session.
export default defineEventHandler(async (event) => {
  const [pathname = ''] = event.path.split('?');
  if (pathname !== BASE && !pathname.startsWith(`${BASE}/`)) return;

  // The catch-all redis cache must never hand gated docs to another visitor (see setup/caching.ts).
  setResponseHeader(event, 'cache-control', 'private, no-store');

  // sendRedirect echoes the target URL into an HTML body, so set the redirect by hand to keep it empty.
  if (!(await verifyOrRefreshOidcToken(event))) {
    setResponseStatus(event, 302);
    setResponseHeader(
      event,
      'location',
      `/api/auth/login?redirectTo=${encodeURIComponent(event.path)}`,
    );
    return '';
  }

  const docsDir = resolve(useRuntimeConfig(event).apiDocsDir);
  const file = await resolveDocsFile(docsDir, pathname);
  if (file) return sendFile(event, file);

  const notFoundPage = join(docsDir, '404.html');
  if (await isFile(notFoundPage)) return sendFile(event, notFoundPage, 404);
  setResponseStatus(event, 404);
  return 'Not found';
});
