// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import telemetry from '@crowd/telemetry'

async function telemetryDistribution(
  name: string,
  value: number,
  tags?: Record<string, string | number>,
) {
  telemetry.distribution(name, value, tags)
}

export { telemetryDistribution }
