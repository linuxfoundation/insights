// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitepress';

import { referenceSections } from './reference-search';

const navItems = [
  { text: 'Quickstart', link: '/' },
  { text: 'Authentication', link: '/authentication' },
  { text: 'Pagination', link: '/pagination' },
  { text: 'Errors', link: '/errors' },
  { text: 'Lifecycle', link: '/lifecycle' },
  { text: 'Changelog', link: '/changelog' },
  { text: 'Reference', link: '/reference' },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LFX Insights API',
  base: '/docs/',
  description: 'Reference documentation for the LFX Insights public API.',
  head: [
    ['link', { rel: 'icon', href: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: navItems,
    sidebar: navItems,
    socialLinks: [{ icon: 'github', link: 'https://github.com/linuxfoundation/insights' }],
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          // Returning undefined keeps VitePress's own heading-based split for the other pages.
          _splitIntoSections: (file) =>
            file.endsWith('/reference.md') ? referenceSections() : undefined,
        },
        translations: {
          button: {
            buttonText: 'Search the docs...',
            buttonAriaLabel: 'Search the docs...',
          },
        },
      },
    },
  },
});
