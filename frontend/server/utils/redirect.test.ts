// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';

import { toSafeRelativePath } from './redirect';

describe('toSafeRelativePath', () => {
  it.each(['/.//evil.com', '/%2e//evil.com', '/./\\evil.com', '/\\evil.com', '//evil.com'])(
    'keeps %s on this origin',
    (url) => {
      const path = toSafeRelativePath(url);
      expect(path.startsWith('//') || path.startsWith('/\\')).toBe(false);
      expect(new URL(path, 'https://insights.example').host).toBe('insights.example');
    },
  );

  it('keeps a normal path with its query and hash', () => {
    expect(toSafeRelativePath('/project/linux?tab=a&x=1#top')).toBe('/project/linux?tab=a&x=1#top');
  });

  it('drops the auth param', () => {
    expect(toSafeRelativePath('/project/linux?auth=success&x=1')).toBe('/project/linux?x=1');
  });

  it('reduces an allowlisted absolute URL to its path', () => {
    expect(toSafeRelativePath('https://insights.linuxfoundation.org/project/linux?x=1')).toBe(
      '/project/linux?x=1',
    );
  });

  it.each([undefined, null, '', 'javascript:alert(1)', 'https://evil.com/x'])(
    'falls back to the root for %s',
    (url) => {
      expect(toSafeRelativePath(url)).toBe('/');
    },
  );
});
