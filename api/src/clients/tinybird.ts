// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createTinybirdClient, type TinybirdClient } from '@lfx-insights/tinybird-client';

// Bucket cache and dedicated read replica are wired in E2 / T-013.
// For now the client fetches fresh on every bucket lookup (no Redis storage).
export const tinybirdClient: TinybirdClient = createTinybirdClient({
  baseUrl: process.env.API_TB_HOST ?? 'https://api.us-west-2.aws.tinybird.co',
  token: process.env.API_TB_TOKEN ?? '',
});
