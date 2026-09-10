// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { buildApp } from './app.js';

function parsePort(value: string | undefined): number {
  if (value === undefined) return 4000;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid PORT environment variable: ${value}`);
  }
  return parsed;
}

const port = parsePort(process.env.PORT);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
