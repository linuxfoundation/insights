import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blog/',
  title: 'The LFX Insights Blog',
  description: `Read the latest news about all that's new with LFX Insights, 
    from new features to how we are building our solutions. `,
  head: [
    [
      'link',
      { rel: 'icon', href: 'https://cdn.platform.linuxfoundation.org/assets/lf-favicon.png' },
    ], // Adjust the path if you use a different favicon format
    ['script', { src: 'https://kit.fontawesome.com/d65f54d9ea.js' }],
    [
      'script',
      {
        defer: '',
        'data-domain': 'insights.linuxfoundation.org',
        src: 'https://plausible.io/js/script.js',
      },
    ],
  ],
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNav\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/CustomNavbar.vue', import.meta.url),
          ),
        },
      ],
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search...',
            buttonAriaLabel: 'Search...',
          },
        },
      },
    },
    sidebar: [
      {
        text: 'Blog',
        items: [
          { text: 'The First 3 Months of Insights', link: '/first-3-months/index.md' },
          { text: 'Introducing Insights', link: '/introducing-insights/index.md' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/linuxfoundation/insights' }],
  },
})
