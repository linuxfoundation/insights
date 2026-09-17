// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { specVersionFor, versionRegistry } from '../src/versions/registry.js';

const registeredPrefixes = versionRegistry.map((entry) => entry.prefix);
const apiRoot = fileURLToPath(new URL('..', import.meta.url));
const tsxBin = join(apiRoot, 'node_modules/.bin/tsx');
const scriptPath = join(apiRoot, 'scripts/export-openapi.ts');
const tmpRoot = mkdtempSync(join(tmpdir(), 'openapi-export-'));

function runExport(args: string[]): void {
  execFileSync(tsxBin, [scriptPath, ...args], { cwd: apiRoot, stdio: 'pipe' });
}

afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
  rmSync(join(apiRoot, 'openapi'), { recursive: true, force: true });
});

describe('openapi:export wiring (AC1, AC5)', () => {
  it('exposes an openapi:export script that runs the export via tsx', () => {
    const pkg = JSON.parse(readFileSync(join(apiRoot, 'package.json'), 'utf-8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['openapi:export']).toBe('tsx scripts/export-openapi.ts');
  });

  it('gitignores the openapi/ output directory', () => {
    const gitignore = readFileSync(join(apiRoot, '.gitignore'), 'utf-8');
    expect(gitignore.split('\n')).toContain('openapi/');
  });
});

describe('per-version export output (AC5)', () => {
  it('writes exactly one artifact per registered version to openapi/ by default', () => {
    rmSync(join(apiRoot, 'openapi'), { recursive: true, force: true });
    runExport([]);
    const files = readdirSync(join(apiRoot, 'openapi')).sort();
    expect(files).toEqual(registeredPrefixes.map((prefix) => `${prefix.slice(1)}.json`).sort());
  });

  it('writes into the directory given as CLI arg, creating parent directories', () => {
    const outDir = join(tmpRoot, 'nested/dir');
    runExport([outDir]);
    for (const prefix of registeredPrefixes) {
      expect(existsSync(join(outDir, `${prefix.slice(1)}.json`))).toBe(true);
    }
  });

  it('exports structurally valid per-version OpenAPI 3.x documents', () => {
    const outDir = join(tmpRoot, 'valid');
    runExport([outDir]);
    for (const prefix of registeredPrefixes) {
      const spec = JSON.parse(readFileSync(join(outDir, `${prefix.slice(1)}.json`), 'utf-8')) as {
        openapi: string;
        info: { title: string; version: string };
        paths: Record<string, unknown>;
      };
      expect(spec.openapi).toMatch(/^3\./);
      expect(spec.info.title).toBeTruthy();
      expect(spec.info.version).toBe(specVersionFor(prefix));
      expect(typeof spec.paths).toBe('object');
      expect(spec.paths).not.toBeNull();
    }
  });
});

describe('exported specs match the live endpoints (AC5)', () => {
  it('each artifact equals the document served at its /<version>/openapi.json', async () => {
    const outDir = join(tmpRoot, 'parity');
    runExport([outDir]);

    const app = await buildApp();
    await app.ready();
    try {
      for (const prefix of registeredPrefixes) {
        const exported: unknown = JSON.parse(
          readFileSync(join(outDir, `${prefix.slice(1)}.json`), 'utf-8'),
        );
        const res = await app.inject({ method: 'GET', url: `${prefix}/openapi.json` });
        expect(res.statusCode).toBe(200);
        expect(exported).toEqual(res.json());
      }
    } finally {
      await app.close();
    }
  });
});

describe('failure handling', () => {
  it('exits non-zero when the output directory cannot be created', () => {
    const blocker = join(tmpRoot, 'blocker');
    writeFileSync(blocker, 'a file, not a directory');
    let error: (Error & { status?: number | null; stderr?: Buffer }) | undefined;
    try {
      runExport([join(blocker, 'out')]);
    } catch (err) {
      error = err as Error & { status?: number | null; stderr?: Buffer };
    }
    expect(error).toBeDefined();
    expect(error?.status).not.toBe(0);
    // The failure must come from the write, not from the script being absent.
    expect(String(error?.stderr)).not.toContain('ERR_MODULE_NOT_FOUND');
  });
});
