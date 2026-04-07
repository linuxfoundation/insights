// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { EventsRepository } from '~~/server/repo/events.repo';

/**
 * API Endpoint: POST /api/events
 * Description: Tracks a user interaction event.
 *
 * Request Body:
 * - key (string, required): Unique event key/identifier
 * - type (string, required): Event type category
 * - name (string, required): Human-readable event name
 * - properties (object, optional): Arbitrary event metadata
 * - feature (string, optional): Feature area where the event occurred
 * - source (string, optional): URL of the page where the event occurred
 * - entrySource (string, optional): URL of the referrer/entry page
 *
 * Response:
 * - 200: { success: true }
 * - 400: Validation error
 * - 503: Database not available
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const insightsDbPool = event.context.insightsDbPool as Pool | undefined;

  if (!insightsDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  const body = await readBody<{
    key?: string;
    type?: string;
    name?: string;
    userId?: string;
    properties?: Record<string, unknown>;
    feature?: string;
    source?: string;
    entrySource?: string;
  }>(event);

  if (!body?.key?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'key is required' });
  }
  if (!body?.type?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'type is required' });
  }
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' });
  }

  const repo = new EventsRepository(insightsDbPool);

  try {
    await repo.track({
      key: body.key.trim(),
      type: body.type.trim(),
      name: body.name.trim(),
      userId: body.userId,
      properties: body.properties,
      feature: body.feature?.trim(),
      source: body.source?.trim(),
      entrySource: body.entrySource?.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error tracking event in POST /api/events', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error', data: { error } });
  }
});
