// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));
const docsRoot = `${apiRoot}docs/site`;

function read(relPath: string): string {
  return readFileSync(`${docsRoot}/${relPath}`, 'utf-8');
}

describe('docs:dev / docs:build scripts (AC1)', () => {
  it('wires docs:dev and docs:build in api/package.json against docs/site', () => {
    const pkg = JSON.parse(readFileSync(`${apiRoot}package.json`, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['docs:dev']).toBe('vitepress dev docs/site');
    expect(pkg.scripts['docs:build']).toBe('vitepress build docs/site');
  });

  it('declares vitepress as a dependency so pnpm install --filter api resolves it', () => {
    const pkg = JSON.parse(readFileSync(`${apiRoot}package.json`, 'utf-8')) as {
      devDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps.vitepress).toBeTruthy();
  });
});

describe('docs/site page structure (AC2)', () => {
  it('has the five required pages', () => {
    expect(() => read('index.md')).not.toThrow();
    expect(() => read('authentication.md')).not.toThrow();
    expect(() => read('pagination.md')).not.toThrow();
    expect(() => read('errors.md')).not.toThrow();
    expect(() => read('changelog.md')).not.toThrow();
  });

  it('links every required page from the VitePress nav/sidebar config', () => {
    const config = read('.vitepress/config.mts');
    for (const link of ['/authentication', '/pagination', '/errors', '/changelog']) {
      expect(config).toContain(link);
    }
  });
});

describe('docs content reflects existing ADRs (AC3)', () => {
  it('quickstart documents lfi_ bearer PATs, the error envelope, and rate limits', () => {
    const index = read('index.md');
    expect(index).toMatch(/lfi_/);
    expect(index.toLowerCase()).toContain('rate limit');
    expect(index.toLowerCase()).toContain('error');
  });

  it('authentication page documents the lfi_ bearer PAT scheme (ADR-0006)', () => {
    const auth = read('authentication.md');
    expect(auth).toMatch(/Authorization: Bearer lfi_/);
  });

  it('pagination page documents cursor-based pagination (ADR-0011)', () => {
    const pagination = read('pagination.md');
    expect(pagination.toLowerCase()).toContain('cursor');
  });

  it('index or errors page documents camelCase JSON and ISO-8601 UTC dates (ADR-0014)', () => {
    const combined = read('index.md') + read('errors.md');
    expect(combined).toMatch(/camelCase/);
    expect(combined).toMatch(/ISO-8601/);
  });

  it('index or pagination page documents the private, no-cache contract (ADR-0013)', () => {
    const combined = read('index.md') + read('pagination.md');
    expect(combined).toContain('Cache-Control: private, max-age=0');
  });

  it('changelog is a stub reserved for IN-1135', () => {
    const changelog = read('changelog.md');
    expect(changelog.toLowerCase()).toContain('changelog');
  });
});

describe('no coupling to frontend/docs (AC4)', () => {
  it('the VitePress config never references frontend/docs', () => {
    const config = read('.vitepress/config.mts');
    expect(config).not.toContain('frontend/docs');
    expect(config).not.toContain('../../frontend');
  });

  it('no page under docs/site references frontend/docs', () => {
    for (const page of [
      'index.md',
      'authentication.md',
      'pagination.md',
      'errors.md',
      'changelog.md',
    ]) {
      expect(read(page)).not.toContain('frontend/docs');
    }
  });
});

describe('no dependency on the OpenAPI export or Scalar yet (AC5)', () => {
  it('the config does not embed Scalar or fetch a generated OpenAPI spec', () => {
    const config = read('.vitepress/config.mts');
    expect(config.toLowerCase()).not.toContain('scalar');
    expect(config).not.toContain('openapi.json');
  });
});
