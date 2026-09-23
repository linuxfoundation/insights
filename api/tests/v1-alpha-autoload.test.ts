// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('v1-alpha group route autoload', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // A group folder exists only once it holds a route.
  const modulesIn = async (group: string) => {
    const dir = fileURLToPath(new URL(`../src/versions/v1-alpha/${group}/`, import.meta.url));
    const files = existsSync(dir) ? await readdir(dir) : [];
    return files
      .filter((name) => name.endsWith('.ts'))
      .map((name) => name.replace(/\.ts$/, ''))
      .sort();
  };

  it('finds the development route modules', async () => {
    expect((await modulesIn('development')).length).toBeGreaterThan(0);
  });

  it.each(['development', 'contributors', 'popularity'])(
    'serves one route per module in src/versions/v1-alpha/%s',
    async (group) => {
      const res = await app.inject({ method: 'GET', url: '/v1-alpha/openapi.json' });
      expect(res.statusCode).toBe(200);
      const spec = res.json<{ paths: Record<string, unknown> }>();
      const served = Object.keys(spec.paths)
        .filter((path) => path.startsWith(`/v1-alpha/projects/{slug}/${group}/`))
        .map((path) => path.slice(path.lastIndexOf('/') + 1))
        .sort();
      expect(served).toEqual(await modulesIn(group));
    },
  );
});
