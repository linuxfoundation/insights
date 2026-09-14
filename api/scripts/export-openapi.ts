// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildApp } from '../src/app.js';

const outPath = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../openapi/v1.json', import.meta.url));

const app = await buildApp();
await app.ready();
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(app.swagger(), null, 2) + '\n');
await app.close();
