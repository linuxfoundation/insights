// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildApp } from '../src/app.js';
import { loadLocalEnv } from '../src/env.js';
import { versionRegistry } from '../src/versions/registry.js';

loadLocalEnv();

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

// A version that was renamed or removed would otherwise leave its old artifact
// behind, publishing a spec the registry no longer supports. Only files shaped
// like version artifacts are touched; the output dir may hold unrelated files.
const expected = new Set(versionRegistry.map((entry) => `${entry.prefix.slice(1)}.json`));
for (const file of await readdir(outDir)) {
  if (/^v\d[\w.-]*\.json$/.test(file) && !expected.has(file)) {
    await unlink(resolve(outDir, file));
  }
}

await app.close();
