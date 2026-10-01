// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  // Local databases run without TLS.
  ssl: boolean;
}

export function createPostgresPool(config: PostgresConfig): Pool {
  return new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // The managed databases present certificates the Node trust store does not hold.
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });
}

export type { Pool } from 'pg';
