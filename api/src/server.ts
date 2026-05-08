// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
