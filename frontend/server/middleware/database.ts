// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getDbPool } from '../utils/db';

export default defineEventHandler(async (event) => {
  // Only apply to chat endpoints
  if (event.node.req.url?.startsWith('/api/chat/')) {
    // Add the database pool to the event context
    event.context.dbPool = getDbPool();
  }
});