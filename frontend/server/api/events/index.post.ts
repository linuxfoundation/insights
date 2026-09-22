// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
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
 * - properties (object, optional): Arbitrary event metadata
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

  // Optionally resolve the authenticated user — this route is public so anonymous events
  // are allowed; we just capture the sub when a valid session exists.
  let userId: string | undefined;
  try {
    const decoded = await verifyOrRefreshOidcToken(event);
    userId = decoded?.sub;
  } catch {
    // No valid session — event is recorded as anonymous.
  }

  const body = await readBody<{
    key?: string;
    properties?: Record<string, unknown>;
    source?: string;
    entrySource?: string;
  }>(event);

  if (!body?.key?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'key is required' });
  }

  const key = body.key.trim() as keyof typeof EVENT_DEFINITIONS;
  const definition = EVENT_DEFINITIONS[key];

  if (!definition) {
    throw createError({ statusCode: 400, statusMessage: `Unknown event key: ${body.key}` });
  }

  const MAX_URL_LENGTH = 2048;
  const source = body.source?.trim().slice(0, MAX_URL_LENGTH);
  const entrySource = body.entrySource?.trim().slice(0, MAX_URL_LENGTH);

  const repo = new EventsRepository(insightsDbPool);

  try {
    await repo.track({
      key: definition.key,
      type: definition.type,
      name: definition.name,
      feature: definition.feature,
      userId,
      properties: body.properties,
      source,
      entrySource,
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error tracking event in POST /api/events', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
