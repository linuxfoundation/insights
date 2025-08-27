// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 * API Endpoint: /api/health/live
 * Method: GET
 * Description: Health check used by Kubernetes to verify the status of the API.
 */
export default defineEventHandler(async (): Promise<boolean> => true)
