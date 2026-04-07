// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

export interface TrackEventInput {
  key: string;
  type: string;
  name: string;
  description?: string;
  userId?: string;
  properties?: Record<string, unknown>;
  feature?: string;
  source?: string;
  entrySource?: string;
}

export class EventsRepository {
  constructor(private pool: Pool) {}

  async track(input: TrackEventInput): Promise<void> {
    const query = `
      INSERT INTO public.events (
        key,
        type,
        name,
        user_id,
        properties,
        feature,
        source,
        entry_source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.pool.query(query, [
      input.key,
      input.type,
      input.name,
      input.userId ?? null,
      input.properties ? JSON.stringify(input.properties) : null,
      input.feature ?? null,
      input.source ?? null,
      input.entrySource ?? null,
    ]);
  }
}
