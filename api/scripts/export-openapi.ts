// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildApp } from '../src/app.js';
import { versionRegistry } from '../src/versions/registry.js';

const outDir = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../openapi/', import.meta.url));

const app = await buildApp();
await app.ready();
await mkdir(outDir, { recursive: true });

for (const entry of versionRegistry) {
  // Fetch the served document (rather than app.swagger() directly) so the export
  // is byte-for-byte identical to what /<version>/openapi.json actually serves.
  const res = await app.inject({ method: 'GET', url: `${entry.prefix}/openapi.json` });
  if (res.statusCode !== 200) {
    throw new Error(
      `Failed to fetch openapi document for version ${entry.prefix}: status ${res.statusCode}`,
    );
  }
  await writeFile(resolve(outDir, `${entry.prefix.slice(1)}.json`), res.rawPayload);
}

await app.close();
