// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createPostgresPool, type Pool } from '@lfx-insights/postgres-client';

import { requiredEnv } from '../env.js';
import { UpstreamUnavailableError } from '../lib/errors.js';
import type { RequestLog } from './tinybird.js';

let pool: Pool | undefined;

export const cmDbEnv = [
  'API_CM_DB_HOST',
  'API_CM_DB_DATABASE',
  'API_CM_DB_USERNAME',
  'API_CM_DB_PASSWORD',
] as const;

// Empty means the default port; anything else must be a valid port number.
export function cmDbPort(): number {
  const raw = process.env.API_CM_DB_PORT;
  if (raw === undefined || raw === '') {
    return 5432;
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_CM_DB_PORT must be an integer between 1 and 65535');
  }
  return port;
}

// Built on first use, so importing this module never needs the API_CM_DB_* variables. The CM
// database holds collections; the API only reads it, so point API_CM_DB_HOST at a read replica.
export function getCmPool(): Pool {
  if (!pool) {
    pool = createPostgresPool({
      host: requiredEnv('API_CM_DB_HOST'),
      port: cmDbPort(),
      database: requiredEnv('API_CM_DB_DATABASE'),
      user: requiredEnv('API_CM_DB_USERNAME'),
      password: requiredEnv('API_CM_DB_PASSWORD'),
      ssl: process.env.API_CM_DB_SSL !== 'false',
    });
  }
  return pool;
}

export async function closeCmPool(): Promise<void> {
  const current = pool;
  pool = undefined;
  await current?.end();
}

// Every Postgres failure becomes a 503, like a Tinybird failure, so driver errors never reach the caller.
export async function queryCm<T>(
  request: RequestLog,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  try {
    const result = await getCmPool().query(sql, params);
    return result.rows as T[];
  } catch (err: unknown) {
    request.log.error({ err }, 'CM database query failed');
    throw new UpstreamUnavailableError();
  }
}
