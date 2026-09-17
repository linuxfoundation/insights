// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
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

// Drop artifacts of versions the registry dropped. The name alone is ambiguous
// (a caller's v1-release-notes.json), so require a string openapi property too.
const expected = new Set(versionRegistry.map((entry) => `${entry.prefix.slice(1)}.json`));
for (const file of await readdir(outDir)) {
  if (!/^v\d[\w.-]*\.json$/.test(file) || expected.has(file)) {
    continue;
  }
  const filePath = resolve(outDir, file);
  let isExporterArtifact = false;
  try {
    const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));
    isExporterArtifact =
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      typeof (parsed as { openapi?: unknown }).openapi === 'string';
  } catch {
    // Unreadable or unparseable means it is not an exporter artifact.
  }
  if (isExporterArtifact) {
    await unlink(filePath);
  }
}

await app.close();
