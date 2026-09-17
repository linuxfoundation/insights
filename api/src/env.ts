// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Entry points call this before reading config. Values already present in the
// environment win over the file, so deployments are unaffected.
export function loadLocalEnv(): void {
  const envPath = fileURLToPath(new URL('../.env', import.meta.url));
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}
