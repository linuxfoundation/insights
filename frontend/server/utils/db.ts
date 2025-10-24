// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';
import { isLocal } from './common';

let insightsDbPool: Pool | null = null;
let cmDbPool: Pool | null = null;

export function getInsightsDbPool(): Pool {
  const config = useRuntimeConfig();
  if (!insightsDbPool) {
    insightsDbPool = new Pool({
      host: config.insightsDbWriteHost,
      port: config.insightsDbPort,
      database: config.insightsDbDatabase,
      user: config.insightsDbUsername,
      password: config.insightsDbPassword,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return insightsDbPool;
}

export function getCMDbPool(): Pool {
  const config = useRuntimeConfig();
  if (!cmDbPool) {
    cmDbPool = new Pool({
      host: config.cmDbWriteHost,
      port: config.cmDbPort,
      database: config.cmDbDatabase,
      user: config.cmDbUsername,
      password: config.cmDbPassword,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return cmDbPool;
}
