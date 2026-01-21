// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

function getMarkdownPaths(dir: string, basePath: string = ''): string[] {
  const paths: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !entry.startsWith('.')) {
        // Check if this directory has an index.md
        const indexPath = join(fullPath, 'index.md');
        try {
          statSync(indexPath);
          const relativePath = `/${relative(basePath, fullPath)}/`;
          paths.push(relativePath);
        } catch {
          // No index.md, continue recursively
        }
        paths.push(...getMarkdownPaths(fullPath, basePath));
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return paths;
}

export default defineSitemapEventHandler(async () => {
  const docsDir = join(process.cwd(), 'docs');
  const paths = ['/', ...getMarkdownPaths(docsDir, docsDir)];

  return paths.map((item) => ({
    loc: `/docs${item}`,
  }));
});
