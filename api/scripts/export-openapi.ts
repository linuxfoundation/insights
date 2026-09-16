// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildApp } from '../src/app.js';
import { API_VERSIONS } from '../src/versions.js';

const outDir = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../openapi/', import.meta.url));

const app = await buildApp();
await app.ready();
await mkdir(outDir, { recursive: true });

for (const version of API_VERSIONS) {
  // Fetch the served document (rather than app.swagger() directly) so the export
  // is byte-for-byte identical to what /<version>/openapi.json actually serves.
  const res = await app.inject({ method: 'GET', url: `/${version}/openapi.json` });
  if (res.statusCode !== 200) {
    throw new Error(
      `Failed to fetch openapi document for version ${version}: status ${res.statusCode}`,
    );
  }
  await writeFile(resolve(outDir, `${version}.json`), res.rawPayload);
}

await app.close();
