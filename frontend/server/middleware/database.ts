// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getInsightsDbPool, getCMDbPool } from '../utils/db';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const allowedRoutes = ['/api/chat/', '/api/auth/login', '/api/auth/callback', '/api/auth/logout'];
  if (allowedRoutes.some((route) => event.node.req.url?.startsWith(route))) {
    // Add the database pool to the event context
    event.context.insightsDbPool = getInsightsDbPool();

    if (config.cmDbEnabled) {
      event.context.cmDbPool = getCMDbPool();
    }
  }
});
