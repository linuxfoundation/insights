// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Prettier configuration for Nuxt 4
 * @type {import("prettier").Config}
 */
export default {
  // Basic formatting
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // Vue-specific settings
  vueIndentScriptAndStyle: false,

  // HTML/Vue template formatting
  htmlWhitespaceSensitivity: 'css',
  singleAttributePerLine: true,

  // Bracket formatting
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: 'always',

  // End of line
  endOfLine: 'lf',

  // Override settings for specific file types
  overrides: [
    {
      files: ['*.vue'],
      options: {
        // Force consistent formatting for Vue files
        semi: true,
        singleAttributePerLine: true,
        htmlWhitespaceSensitivity: 'css',
        // Prevent breaking Vue template expressions across multiple lines
        printWidth: 120,
      },
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'preserve',
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
