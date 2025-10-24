// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getInsightsDbPool, getCMDbPool } from '../utils/db';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Only apply to chat endpoints
  if (event.node.req.url?.startsWith('/api/chat/')) {
    // Add the database pool to the event context
    event.context.insightsDbPool = getInsightsDbPool();

    if (config.cmDbEnabled) {
      event.context.cmDbPool = getCMDbPool();
    }
  }
});
