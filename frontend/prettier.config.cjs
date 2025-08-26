// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
module.exports = {
  // Basic formatting
  semi: false,
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
        singleAttributePerLine: true,
        htmlWhitespaceSensitivity: 'css',
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
  ],
}
