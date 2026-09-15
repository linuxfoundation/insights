// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// Integration tier: runs the real vitepress build; a structural check cannot prove the build succeeds.
const apiRoot = fileURLToPath(new URL('..', import.meta.url));
const outDir = mkdtempSync(join(tmpdir(), 'docs-site-build-'));

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

describe('pnpm docs:build produces a static build with no errors (AC1)', () => {
  it('builds docs/site to a static bundle without depending on the OpenAPI export or Scalar (AC5)', () => {
    execFileSync(
      join(apiRoot, 'node_modules/.bin/vitepress'),
      ['build', 'docs/site', '--outDir', outDir],
      { cwd: apiRoot, stdio: 'pipe' },
    );
    expect(existsSync(join(outDir, 'index.html'))).toBe(true);
  }, 60_000);
});
