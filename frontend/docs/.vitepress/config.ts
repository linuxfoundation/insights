// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',
  title: "LFX Insights Documentation",
  description: "Insights evaluates the health and trustworthiness of the world's most critical open source software.",
  head: [
    ['link', { rel: 'icon', href: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' }] // Adjust the path if you use a different favicon format
  ],
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNav\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/CustomNavbar.vue', import.meta.url)
          )
        }
      ]
    }
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search the docs...',
            buttonAriaLabel: 'Search the docs...'
          }
        }
      }
    },
    // https://vitepress.dev/reference/default-theme-config
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is LFX Insights?', link: '/lfx-insights' },
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Open Source Index', link: '/features/open-source-index' },
          { text: 'Collections', link: '/features/collections' },
          { text: 'Projects', link: '/features/projects' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/linuxfoundation/insights' }
    ]
  }
})
