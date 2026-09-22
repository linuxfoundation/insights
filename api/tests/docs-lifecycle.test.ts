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

describe('lifecycle page (AC2, AC3)', () => {
  it('documents /v1-alpha: allow-listed access, no contract guarantees, breaking changes allowed', () => {
    const lifecycle = read('lifecycle.md');
    expect(lifecycle).toContain('/v1-alpha');
    expect(lifecycle.toLowerCase()).toContain('allow-listed');
    expect(lifecycle.toLowerCase()).toContain('breaking change');
    expect(lifecycle.toLowerCase()).toContain('no contract guarantees');
  });

  it('marks identity fields provisional in /v1-alpha', () => {
    const alpha = read('lifecycle.md').split('## `/v1`')[0];
    expect(alpha.toLowerCase()).toMatch(/identity fields[^.]*provisional/);
    for (const field of ['display names', 'avatars', 'GitHub handles', 'logos']) {
      expect(alpha).toContain(field);
    }
  });

  it('documents the /v1 contract guarantees', () => {
    const lifecycle = read('lifecycle.md');
    expect(lifecycle.toLowerCase()).toContain('additive');
    expect(lifecycle.toLowerCase()).toMatch(/ignore (fields|unknown)/);
    expect(lifecycle).toContain('/v2');
  });

  it('documents /v1 promotion criteria', () => {
    const lifecycle = read('lifecycle.md');
    expect(lifecycle.toLowerCase()).toContain('load test');
    expect(lifecycle.toLowerCase()).toContain('security sign-off');
  });

  it('documents the 410 Gone sunset window for promoted alpha routes', () => {
    const lifecycle = read('lifecycle.md');
    expect(lifecycle).toMatch(/returns.*410|410.*on promotion|immediately.*410/i);
    expect(lifecycle.toLowerCase()).toMatch(/410[^.]*two weeks|two weeks[^.]*410/);
    expect(lifecycle).toContain('rel="successor-version"');
  });

  it('documents the deprecation signal headers for retiring versions', () => {
    const lifecycle = read('lifecycle.md');
    expect(lifecycle.toLowerCase()).toContain('deprecation signals');
    expect(lifecycle).toContain('`Deprecation`');
    expect(lifecycle).toContain('`Sunset`');
    expect(lifecycle).toContain('rel="deprecation"');
  });
});

describe('changelog entry format (AC1, AC4)', () => {
  it('documents a reusable entry format with change categories', () => {
    const changelog = read('changelog.md');
    for (const category of ['Added', 'Changed', 'Deprecated', 'Removed']) {
      expect(changelog).toContain(category);
    }
  });

  it('still communicates that no versioned release has shipped yet', () => {
    const changelog = read('changelog.md');
    expect(changelog.toLowerCase()).toMatch(/no .*release/);
  });

  it('links to the lifecycle page for how endpoints reach a released state', () => {
    const changelog = read('changelog.md');
    expect(changelog).toContain('/lifecycle');
  });
});
