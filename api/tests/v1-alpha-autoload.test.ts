// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

// Modules under development/ register themselves, so one that fails to load or registers a path
// outside the group would drop out of the spec without anyone editing a list. Filename = path leaf.
describe('v1-alpha development route autoload', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves one development route per module in src/versions/v1-alpha/development', async () => {
    const dir = fileURLToPath(new URL('../src/versions/v1-alpha/development/', import.meta.url));
    const modules = (await readdir(dir))
      .filter((name) => name.endsWith('.ts'))
      .map((name) => name.replace(/\.ts$/, ''))
      .sort();
    expect(modules.length).toBeGreaterThan(0);

    const res = await app.inject({ method: 'GET', url: '/v1-alpha/openapi.json' });
    expect(res.statusCode).toBe(200);
    const spec = res.json<{ paths: Record<string, unknown> }>();
    const served = Object.keys(spec.paths)
      .filter((path) => path.startsWith('/v1-alpha/projects/{slug}/development/'))
      .map((path) => path.slice(path.lastIndexOf('/') + 1))
      .sort();
    expect(served).toEqual(modules);
  });
});
