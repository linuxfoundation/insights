// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { docsFixtureDist } from './setup/build-docs-fixture.js';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));
const docsRoot = `${apiRoot}docs/site`;

function read(relPath: string): string {
  return readFileSync(`${docsRoot}/${relPath}`, 'utf-8');
}

describe('Reference page wiring (AC1, AC3)', () => {
  it('links the reference page from the VitePress nav', () => {
    const config = read('.vitepress/config.mts');
    expect(config).toContain('/reference');
  });

  it('reference.md exists and mounts the Scalar embed component', () => {
    const page = read('reference.md');
    expect(page).toContain('ScalarReference');
  });

  it('the Scalar embed component points at the live OpenAPI spec route', () => {
    const component = read('.vitepress/theme/ScalarReference.vue');
    expect(component).toContain('/v1/openapi.json');
  });

  it('declares @scalar/api-reference as an api devDependency', () => {
    const pkg = JSON.parse(readFileSync(`${apiRoot}package.json`, 'utf-8')) as {
      devDependencies?: Record<string, string>;
    };
    expect(pkg.devDependencies?.['@scalar/api-reference']).toBeTruthy();
  });
});

describe('try-it client is explicitly disabled (AC2)', () => {
  it('sets hideTestRequestButton and hideClientButton to true rather than omitting them', () => {
    const component = read('.vitepress/theme/ScalarReference.vue');
    expect(component).toMatch(/hideTestRequestButton:\s*true/);
    expect(component).toMatch(/hideClientButton:\s*true/);
  });
});

describe('the built reference page mounts the Scalar viewer (AC1)', () => {
  it('reference.html renders the reference page and ships a hydration script for the Scalar mount', () => {
    const built = readFileSync(join(docsFixtureDist, 'reference.html'), 'utf-8');
    expect(built).toContain('API Reference');
    expect(built).toMatch(/<script[^>]*type="module"[^>]*src="\/docs\/assets\/app\./);
  });
});
