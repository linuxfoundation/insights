// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
    const config = useRuntimeConfig()
  if (!pool) {
    pool = new Pool({
      host: config.insightsDbWriteHost,
      port: config.insightsDbPort,
      database: config.insightsDbDatabase,
      user: config.insightsDbUsername,
      password: config.insightsDbPassword,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}