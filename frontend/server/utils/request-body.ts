// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getRequestWebStream, type H3Event } from 'h3';

export const MAX_RETURN_TO_LENGTH = 2048;

/**
 * Reads a JSON body up to maxBytes. Returns undefined when the body is missing, malformed or
 * too large. Reads the raw stream because readBody skips bodies without Content-Length, which
 * happens behind Cloudflare.
 */
export async function readBoundedJsonBody(
  event: H3Event,
  maxBytes: number,
): Promise<unknown | undefined> {
  const stream = getRequestWebStream(event);
  if (!stream) return undefined;

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(combined));
  } catch {
    return undefined;
  }
}

/** Returns body.returnTo when it is a string no longer than a URL, otherwise undefined. */
export function readReturnTo(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const { returnTo } = body as { returnTo?: unknown };
  if (typeof returnTo !== 'string' || returnTo.length > MAX_RETURN_TO_LENGTH) return undefined;
  return returnTo;
}
