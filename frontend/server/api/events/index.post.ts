// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getRequestWebStream } from 'h3';
import type { Pool } from 'pg';

import { EVENT_DEFINITIONS } from '~/components/shared/types/events';
import { EventsRepository } from '~~/server/repo/events.repo';
import { verifyOrRefreshOidcToken } from '~~/server/utils/auth-refresh';

/**
 * API Endpoint: POST /api/events
 * Description: Tracks a user interaction event.
 *
 * Request Body:
 * - key (string, required): Must match a key in the server-side event catalog
 * - properties (object, optional): Event properties; filtered server-side against the catalog allowlist for the given key
 * - source (string, optional): URL of the page where the event occurred
 * - entrySource (string, optional): URL of the referrer/entry page
 *
 * Response:
 * - 200: { success: true }
 * - 400: Validation error or unknown event key
 * - 503: Database not available
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const insightsDbPool = event.context.insightsDbPool as Pool | undefined;

  if (!insightsDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  // Optionally resolve the authenticated user. Public route so anonymous events
  // are allowed; capture the sub when a valid session exists.
  let userId: string | undefined;
  try {
    const decoded = await verifyOrRefreshOidcToken(event);
    userId = decoded?.sub;
  } catch (err) {
    console.warn('[events] auth resolution failed, recording as anonymous:', err);
  }

  // Use the Web Streams API to read the body directly from the raw stream.
  // H3's readBody skips reading when Content-Length is absent, which happens when
  // Cloudflare proxies the request and strips that header before forwarding to the origin.
  const MAX_BODY_BYTES = 20_480;
  let body: {
    key?: string;
    properties?: Record<string, unknown>;
    source?: string;
    entrySource?: string;
  } | null = null;
  try {
    const stream = getRequestWebStream(event);
    if (stream) {
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_BODY_BYTES) {
          throw createError({ statusCode: 413, statusMessage: 'Request body too large' });
        }
        chunks.push(value);
      }
      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.byteLength;
      }
      body = JSON.parse(new TextDecoder().decode(combined));
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err;
    // malformed or missing body; validation below produces the right error
  }

  if (typeof body?.key !== 'string' || !body.key.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'key is required' });
  }

  const MAX_PROPERTIES_BYTES = 10_240;
  if (body.properties !== undefined) {
    if (typeof body.properties !== 'object' || Array.isArray(body.properties)) {
      throw createError({ statusCode: 400, statusMessage: 'properties must be an object' });
    }
    if (Buffer.byteLength(JSON.stringify(body.properties), 'utf8') > MAX_PROPERTIES_BYTES) {
      throw createError({ statusCode: 400, statusMessage: 'properties payload too large' });
    }
  }

  const key = body.key.trim() as keyof typeof EVENT_DEFINITIONS;
  const definition = EVENT_DEFINITIONS[key];

  if (!definition) {
    throw createError({ statusCode: 400, statusMessage: `Unknown event key: ${body.key}` });
  }

  const MAX_URL_LENGTH = 2048;
  const source = body.source?.trim().slice(0, MAX_URL_LENGTH);
  const entrySource = body.entrySource?.trim().slice(0, MAX_URL_LENGTH);

  // Strip any property keys not in the catalog allowlist for this event.
  const allowed = new Set(definition.allowedProperties);
  const properties = body.properties
    ? Object.fromEntries(Object.entries(body.properties).filter(([k]) => allowed.has(k)))
    : undefined;

  const repo = new EventsRepository(insightsDbPool);

  try {
    await repo.track({
      key: definition.key,
      type: definition.type,
      name: definition.name,
      feature: definition.feature,
      userId,
      properties,
      source,
      entrySource,
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error tracking event in POST /api/events', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
