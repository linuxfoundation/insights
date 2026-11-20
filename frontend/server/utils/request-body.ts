// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';

export const MAX_RETURN_TO_LENGTH = 2048;

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Reads a JSON body up to maxBytes, or returns undefined when it is missing, malformed or too large.
 * Reads the Node request directly because readBody skips bodies without Content-Length (Cloudflare strips it).
 */
export function readBoundedJsonBody(
  event: H3Event,
  maxBytes: number,
): Promise<unknown | undefined> {
  const req = event.node.req;
  if (!BODY_METHODS.has(event.method) || req.readableEnded) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    const finish = (value: unknown | undefined) => {
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
      resolve(value);
    };
    const onData = (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        // Keep the socket usable for the response by discarding the rest of the upload.
        req.resume();
        finish(undefined);
        return;
      }
      chunks.push(chunk);
    };
    const onEnd = () => {
      try {
        finish(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        finish(undefined);
      }
    };
    const onError = () => finish(undefined);

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
  });
}

export function readReturnTo(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const { returnTo } = body as { returnTo?: unknown };
  if (typeof returnTo !== 'string' || returnTo.length > MAX_RETURN_TO_LENGTH) return undefined;
  return returnTo;
}
