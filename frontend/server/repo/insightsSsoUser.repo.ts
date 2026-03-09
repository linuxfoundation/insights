// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

export interface InsightsSsoUser {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  username?: string;
  accountId?: string;
  accountName?: string;
  accountWebsite?: string;
  updatedAt: string;
}

export interface UpsertInsightsSsoUserInput {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  accountId?: string;
  accountName?: string;
  accountWebsite?: string;
}

export class InsightsSsoUserRepository {
  constructor(private pool: Pool) {}

  async upsert(input: UpsertInsightsSsoUserInput): Promise<InsightsSsoUser> {
    const query = `
      INSERT INTO "insightsSsoUsers" (id, "displayName", "avatarUrl", email, username, "accountId", "accountName", "accountWebsite", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (username) DO UPDATE SET
        "displayName" = COALESCE(EXCLUDED."displayName", "insightsSsoUsers"."displayName"),
        "avatarUrl" = COALESCE(EXCLUDED."avatarUrl", "insightsSsoUsers"."avatarUrl"),
        email = COALESCE(EXCLUDED.email, "insightsSsoUsers".email),
        "accountId" = COALESCE(EXCLUDED."accountId", "insightsSsoUsers"."accountId"),
        "accountName" = COALESCE(EXCLUDED."accountName", "insightsSsoUsers"."accountName"),
        "accountWebsite" = COALESCE(EXCLUDED."accountWebsite", "insightsSsoUsers"."accountWebsite"),
        "updatedAt" = NOW()
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      input.id,
      input.displayName ?? null,
      input.avatarUrl ?? null,
      input.email ?? null,
      input.username ?? null,
      input.accountId ?? null,
      input.accountName ?? null,
      input.accountWebsite ?? null,
    ]);

    return result.rows[0];
  }

  async findById(id: string): Promise<InsightsSsoUser | null> {
    const query = `
      SELECT * FROM "insightsSsoUsers"
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByUsername(username: string): Promise<InsightsSsoUser | null> {
    const query = `
      SELECT * FROM "insightsSsoUsers"
      WHERE username = $1
    `;

    const result = await this.pool.query(query, [username]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
