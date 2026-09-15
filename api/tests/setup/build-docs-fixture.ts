// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = fileURLToPath(new URL('../..', import.meta.url));
export const docsFixtureDist = join(apiRoot, '.vitepress-test-dist');

// Runs once, before any test file, so it never races docs-site-build.test.ts's own build.
export default function setup() {
  execFileSync(
    join(apiRoot, 'node_modules/.bin/vitepress'),
    ['build', 'docs/site', '--outDir', docsFixtureDist],
    { cwd: apiRoot, stdio: 'pipe' },
  );

  return () => {
    rmSync(docsFixtureDist, { recursive: true, force: true });
  };
}
