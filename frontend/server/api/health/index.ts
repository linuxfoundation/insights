// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from "~~/server/data/tinybird/tinybird";
import type { HealthCheckResponse, PingResult } from "~~/types/health";

/**
 * API Endpoint: /api/health
 * Method: GET
 * Description: Health check endpoint to verify the status of the API.
 * Dependent services can be extended using the checks array.
 * Response:
 * - healthy (boolean): API is healthy or not / all checks should be true
 * - checks (Record<string, boolean>): Checks for individual services
 * - detail (string): The error message if the endpoint throws an error
 */
export default defineEventHandler(async (): Promise<HealthCheckResponse> => {
  try {
    const pingTinybirdResult = await fetchFromTinybird<PingResult[]>(
      "/v0/pipes/ping.json",
      {}
    );
    const isTinybirdReachable = pingTinybirdResult.data.length > 0 && pingTinybirdResult.data[0].result === "pong";

    const checks = [isTinybirdReachable];

    return {
      healthy: checks.every((check) => check === true),
      checks: {
        tinybird: isTinybirdReachable,
      },
    };
  } catch (err) {
    return {
      healthy: false,
      checks: {},
      detail: err instanceof Error ? err.message : "Unknown error",
    };
  }
});
