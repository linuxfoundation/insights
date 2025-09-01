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
    ['link', { rel: 'icon', href: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' }], // Adjust the path if you use a different favicon format
    ['script', { src: 'https://kit.fontawesome.com/b5289aebdf.js' }]
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
    },
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
          { text: 'What is Insights?', link: '/introduction/what-is-insights/index.md' },
          { text: 'LF Open Source Index', link: '/introduction/lf-oss-index/index.md' },
          { text: 'Data Sources', link: '/introduction/data-sources/index.md' },
          { text: 'Data Quality', link: '/introduction/data-quality/index.md' },
          { text: 'Contributions', link: '/introduction/contributions/index.md' },
          { text: 'Maintainers', link: '/introduction/maintainers/index.md' },
        ]
      },
      {
        text: 'Metrics',
        items: [
          { text: 'Health Score', link: '/metrics/health-score/index.md' },
          { text: 'Contributors', link: '/metrics/contributors/index.md' },
          { text: 'Popularity', link: '/metrics/popularity/index.md' },
          { text: 'Development', link: '/metrics/development/index.md' },
          { text: 'Security & Best Practices', link: '/metrics/security/index.md' },
        ]
      },
      {
        text: 'More',
        items: [
          { text: 'FAQ', link: '/more/faq/index.md' },
          { text: 'Glossary', link: '/more/glossary/index.md' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/linuxfoundation/insights' }
    ]
  }
})
