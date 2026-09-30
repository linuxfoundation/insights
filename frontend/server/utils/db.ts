// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createPostgresPool, type Pool } from '@lfx-insights/postgres-client';

import { isLocal } from './common';

let insightsDbPool: Pool | null = null;
let cmDbPool: Pool | null = null;

export function getInsightsDbPool(): Pool {
  const config = useRuntimeConfig();
  if (!insightsDbPool) {
    insightsDbPool = createPostgresPool({
      host: config.insightsDbWriteHost,
      port: config.insightsDbPort,
      database: config.insightsDbDatabase,
      user: config.insightsDbUsername,
      password: config.insightsDbPassword,
      ssl: !isLocal,
    });
  }
  return insightsDbPool;
}

export function getCMDbPool(): Pool {
  const config = useRuntimeConfig();
  if (!cmDbPool) {
    cmDbPool = createPostgresPool({
      host: config.cmDbWriteHost,
      port: config.cmDbPort,
      database: config.cmDbDatabase,
      user: config.cmDbUsername,
      password: config.cmDbPassword,
      ssl: !isLocal,
    });
  }
  return cmDbPool;
}
