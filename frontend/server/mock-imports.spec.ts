// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, test } from 'vitest';

const serverDir = __dirname;
const mocksDir = join(serverDir, 'mocks');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return path === mocksDir ? [] : sourceFiles(path);
    }
    const isSource = /\.(ts|js|mjs|vue)$/.test(entry.name);
    const isTest = /\.(spec|test)\.[a-z]+$/.test(entry.name);
    return isSource && !isTest ? [path] : [];
  });
}

describe('server modules', () => {
  test('do not import from server/mocks', () => {
    const importers = sourceFiles(serverDir)
      .filter((file) => /from\s+['"](?:[^'"]*\/)?mocks\//.test(readFileSync(file, 'utf8')))
      .map((file) => relative(serverDir, file));

    expect(importers).toEqual([]);
  });
});
