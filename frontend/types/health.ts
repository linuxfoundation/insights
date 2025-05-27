// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export interface PingResult {
  result: string;
}

export interface HealthCheckResponse {
  healthy: boolean;
  checks: Record<string, boolean>;
  detail?: string;
}
