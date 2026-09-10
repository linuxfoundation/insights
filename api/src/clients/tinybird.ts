// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createTinybirdClient, type TinybirdClient } from '@lfx-insights/tinybird-client';

const token = process.env.API_TB_TOKEN;
if (!token) {
  throw new Error('API_TB_TOKEN environment variable is required');
}

export const tinybirdClient: TinybirdClient = createTinybirdClient({
  baseUrl: process.env.API_TB_HOST ?? 'https://api.us-west-2.aws.tinybird.co',
  token,
});
