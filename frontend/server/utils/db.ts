// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.INSIGHTS_DB_WRITE_HOST,
      port: parseInt(process.env.INSIGHTS_DB_PORT || '5432', 10),
      database: process.env.INSIGHTS_DB_DATABASE,
      user: process.env.INSIGHTS_DB_USERNAME,
      password: process.env.INSIGHTS_DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}