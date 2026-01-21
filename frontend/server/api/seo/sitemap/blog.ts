// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function getBlogPosts(dir: string): string[] {
  const paths: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      // Blog posts are directories with index.md (excluding .vitepress and other dot folders)
      if (stat.isDirectory() && !entry.startsWith('.')) {
        const indexPath = join(fullPath, 'index.md');
        try {
          statSync(indexPath);
          paths.push(`/${entry}/`);
        } catch {
          // No index.md, skip
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return paths;
}

export default defineSitemapEventHandler(async () => {
  const blogDir = join(process.cwd(), 'blog');
  const paths = getBlogPosts(blogDir);

  return paths.map((item) => ({
    loc: `/blog${item}`,
  }));
});
