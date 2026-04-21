// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const MAX_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
];
const PRIVATE_172 = /^172\.(1[6-9]|2\d|3[0-1])\./;

function isPublicHost(hostname: string): boolean {
  if (!hostname) return false;
  if (PRIVATE_172.test(hostname)) return false;
  return !PRIVATE_HOST_PATTERNS.some((re) => re.test(hostname));
}

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event) as { url?: string };
  if (!url || typeof url !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid url' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported protocol' });
  }
  if (!isPublicHost(parsed.hostname)) {
    throw createError({ statusCode: 400, statusMessage: 'Host not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'image/*' },
    });

    if (!upstream.ok || !upstream.body) {
      throw createError({ statusCode: 502, statusMessage: 'Upstream fetch failed' });
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      throw createError({ statusCode: 415, statusMessage: 'Not an image' });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
      throw createError({ statusCode: 413, statusMessage: 'Image too large' });
    }

    setHeader(event, 'Content-Type', contentType);
    setHeader(event, 'Cache-Control', 'public, max-age=86400, immutable');
    setHeader(event, 'X-Content-Type-Options', 'nosniff');
    return buffer;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err;
    throw createError({ statusCode: 502, statusMessage: 'Upstream fetch failed' });
  } finally {
    clearTimeout(timeout);
  }
});
