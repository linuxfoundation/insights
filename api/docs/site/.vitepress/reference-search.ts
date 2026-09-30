// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Section {
  anchor: string;
  titles: string[];
  text: string;
}

interface Operation {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: { name: string; description?: string }[];
}

// The Scalar source marked `default` in theme/ScalarReference.vue; its hashes carry no document slug.
const SPEC_PREFIX = '/v1-alpha';

const apiRoot = fileURLToPath(new URL('../../..', import.meta.url));

// Scalar renders the reference in the browser, so the search index is built from the spec instead.
// The exporter runs out of process because route autoloading breaks inside the bundled VitePress config.
export function referenceSections(): Section[] {
  const outDir = mkdtempSync(join(tmpdir(), 'docs-openapi-'));
  let spec: { paths?: Record<string, Record<string, Operation>> };
  try {
    execFileSync(join(apiRoot, 'node_modules/.bin/tsx'), ['scripts/export-openapi.ts', outDir], {
      cwd: apiRoot,
      stdio: 'pipe',
    });
    spec = JSON.parse(readFileSync(join(outDir, `${SPEC_PREFIX.slice(1)}.json`), 'utf-8'));
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }

  const sections: Section[] = [];
  const seenTags = new Set<string>();
  for (const [path, ops] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(ops)) {
      const tag = op.tags?.[0];
      if (!tag) continue;
      const tagAnchor = `tag/${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (!seenTags.has(tag)) {
        seenTags.add(tag);
        sections.push({ anchor: tagAnchor, titles: ['Reference', tag], text: tag });
      }
      const verb = method.toUpperCase();
      const params = (op.parameters ?? []).map((p) => `${p.name} ${p.description ?? ''}`);
      sections.push({
        anchor: `${tagAnchor}/${verb}${path}`,
        titles: ['Reference', tag, op.summary ?? `${verb} ${path}`],
        text: [`${verb} ${path}`, op.description ?? '', ...params].join('\n'),
      });
    }
  }
  return sections;
}
