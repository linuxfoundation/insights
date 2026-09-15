// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitepress';

const navItems = [
  { text: 'Quickstart', link: '/' },
  { text: 'Authentication', link: '/authentication' },
  { text: 'Pagination', link: '/pagination' },
  { text: 'Errors', link: '/errors' },
  { text: 'Lifecycle', link: '/lifecycle' },
  { text: 'Changelog', link: '/changelog' },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LFX Insights API',
  description: 'Reference documentation for the LFX Insights public API.',
  base: '/docs/',
  head: [
    ['link', { rel: 'icon', href: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: navItems,
    sidebar: [{ text: 'Guide', items: navItems }],
    socialLinks: [{ icon: 'github', link: 'https://github.com/linuxfoundation/insights' }],
    search: {
      provider: 'local',
      options: {
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
