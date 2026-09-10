// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createTinybirdClient, type TinybirdClient } from '@lfx-insights/tinybird-client';

let client: TinybirdClient | undefined;

/**
 * Lazily constructs the Tinybird client on first use so importing this module
 * never fails (e.g. in tests or tooling that don't touch Tinybird); env
 * validation only happens once the client is actually needed.
 */
export function getTinybirdClient(): TinybirdClient {
  if (!client) {
    const token = process.env.API_TB_TOKEN;
    if (!token) {
      throw new Error('API_TB_TOKEN environment variable is required');
    }
    client = createTinybirdClient({
      baseUrl: process.env.API_TB_HOST ?? 'https://api.us-west-2.aws.tinybird.co',
      token,
    });
  }
  return client;
}
