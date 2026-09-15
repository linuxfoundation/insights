// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

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

  it('gitignores the openapi/ output directory (AC5)', () => {
    const gitignore = readFileSync(join(apiRoot, '.gitignore'), 'utf-8');
    expect(gitignore.split('\n')).toContain('openapi/');
  });
});

describe('export output (AC1, AC3)', () => {
  it('writes openapi/v1.json by default, creating the directory (AC1)', () => {
    rmSync(join(apiRoot, 'openapi'), { recursive: true, force: true });
    runExport([]);
    expect(existsSync(join(apiRoot, 'openapi/v1.json'))).toBe(true);
  });

  it('writes to the path given as CLI arg, creating parent directories (AC1)', () => {
    const outPath = join(tmpRoot, 'nested/dir/spec.json');
    runExport([outPath]);
    expect(existsSync(outPath)).toBe(true);
  });

  it('exports a structurally valid OpenAPI 3.x document (AC3)', () => {
    const outPath = join(tmpRoot, 'valid.json');
    runExport([outPath]);
    const spec = JSON.parse(readFileSync(outPath, 'utf-8')) as {
      openapi: string;
      info: { title: string; version: string };
      paths: Record<string, unknown>;
    };
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info.title).toBeTruthy();
    expect(spec.info.version).toBeTruthy();
    expect(typeof spec.paths).toBe('object');
    expect(spec.paths).not.toBeNull();
  });
});

describe('exported spec matches the live endpoint (AC2)', () => {
  it('equals the document served at /v1/openapi.json', async () => {
    const outPath = join(tmpRoot, 'parity.json');
    runExport([outPath]);
    const exported: unknown = JSON.parse(readFileSync(outPath, 'utf-8'));

    const app = await buildApp();
    await app.ready();
    const res = await app.inject({ method: 'GET', url: '/v1/openapi.json' });
    await app.close();

    expect(res.statusCode).toBe(200);
    expect(exported).toEqual(res.json());
  });
});

describe('failure handling (AC4)', () => {
  it('exits non-zero when the output path cannot be written', () => {
    const blocker = join(tmpRoot, 'blocker');
    writeFileSync(blocker, 'a file, not a directory');
    let error: (Error & { status?: number | null; stderr?: Buffer }) | undefined;
    try {
      runExport([join(blocker, 'spec.json')]);
    } catch (err) {
      error = err as Error & { status?: number | null; stderr?: Buffer };
    }
    expect(error).toBeDefined();
    expect(error?.status).not.toBe(0);
    // The failure must come from the write, not from the script being absent.
    expect(String(error?.stderr)).not.toContain('ERR_MODULE_NOT_FOUND');
  });
});
