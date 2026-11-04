// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitepress';

import { referenceSections, webApiSections } from './reference-search';

const navItems = [
  { text: 'Quickstart', link: '/' },
  { text: 'Authentication', link: '/authentication' },
  { text: 'Pagination', link: '/pagination' },
  { text: 'Errors', link: '/errors' },
  { text: 'Lifecycle', link: '/lifecycle' },
  { text: 'Changelog', link: '/changelog' },
  { text: 'Reference', link: '/reference' },
  { text: 'Web API', link: '/web-api' },
  { text: 'Health Score v2 migration', link: '/health-score-v2-migration/' },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LFX Insights API',
  base: '/docs/api/',
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
          _splitIntoSections: (file) => {
            if (file.endsWith('/reference.md')) return referenceSections();
            if (file.endsWith('/web-api.md')) return webApiSections();
            return undefined;
          },
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
