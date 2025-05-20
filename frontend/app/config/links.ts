// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRuntimeConfig } from "nuxt/app";

const config = useRuntimeConfig()

export const links = {
  trustScore: `${config.public.appUrl}/docs/metrics/health-score`,
  securityScore: `${config.public.appUrl}/docs/metrics/security`,
  ospsScore: 'https://baseline.openssf.org/versions/2025-02-25',
};
