// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://nuxt.com/docs/api/configuration/nuxt-config

import head from './setup/head';
import tailwindcss from './setup/tailwind';
import primevue from './setup/primevue';
import echarts from './setup/echarts';
import caching from './setup/caching';
import sitemap from './setup/sitemap';
import rateLimiter from './setup/rate-limiter';

const isProduction = process.env.NUXT_APP_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
export default defineNuxtConfig({
  app: {
    head,
  },
  components: false,
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  experimental: {
    typedPages: true,
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    'nuxt-echarts',
    '@nuxtjs/storybook',
    'nuxt-gtag',
    '@nuxtjs/plausible',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxt/image',
  ],
  image: {
    formats: ['webp', 'avif', 'jpeg', 'png'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },
  plugins: ['~/plugins/vue-query.ts', '~/plugins/analytics.ts', '~/plugins/canonical.ts'],
  css: ['~/assets/styles/main.scss'],
  tailwindcss,
  primevue,
  echarts,
  runtimeConfig: {
    // These are only available on the server-side and can be overridden by the .env file
    appEnv: process.env.APP_ENV,
    tinybirdBaseUrl: 'https://api.us-west-2.aws.tinybird.co',
    tinybirdToken: '',
    highlightedIds: '',
    redisUrl: '',
    githubApiToken: '',
    lfxAuth0JwtSecret: '',
    lfxAuth0TokenClaimGroupKey: '',
    lfxAuth0TokenClaimGroupName: '',
    auth0ClientSecret: '',
    auth0CookieDomain: 'insights.linuxfoundation.org',
    jwtSecret: '',
    insightsDbWriteHost: 'localhost',
    insightsDbReadHost: 'localhost',
    insightsDbPort: 5432,
    insightsDbUsername: 'postgres',
    insightsDbPassword: 'example',
    insightsDbDatabase: 'insights',
    cmDbEnabled: isProduction,
    cmDbWriteHost: 'localhost',
    cmDbReadHost: 'localhost',
    cmDbPort: 5432,
    cmDbUsername: 'postgres',
    cmDbPassword: 'example',
    cmDbDatabase: 'crowd-web',
    dataCopilotDefaultSegmentId: '',
    rateLimiter: rateLimiter,
    // These are also exposed on the client-side
    public: {
      apiBase: '/api',
      appUrl: isProduction ? 'https://insights.linuxfoundation.org' : 'http://localhost:3000',
      appEnv: process.env.APP_ENV,
      auth0Domain: isProduction
        ? 'https://sso.linuxfoundation.org'
        : 'https://linuxfoundation-staging.auth0.com',
      auth0ClientId: '',
      auth0RedirectUri: isProduction
        ? 'https://insights.linuxfoundation.org/auth/callback'
        : 'http://localhost:3000/auth/callback',
      auth0Audience: isProduction
        ? 'https://insights.linuxfoundation.org/api/'
        : 'http://localhost:3000/api/',
      lfxSegmentCdnUrl: process.env.LFX_SEGMENT_CDN_URL || '',
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => ['lfx-footer'].includes(tag),
    },
  },
  gtag: {
    enabled: isProduction,
    id: 'G-EB92ZZFBNS',
  },
  plausible: {
    // Use as fallback if no runtime config is available at runtime
    enabled: isProduction,
    domain: 'insights.linuxfoundation.org',
  },
  vite: {
    server: {
      proxy: {
        '/docs': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/docs/, '/docs'),
        },
        '/blog': {
          target: 'http://localhost:5174',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/blog/, '/blog'),
        },
      },
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Only split heavy visualization libraries to avoid breaking Vue reactivity
            if (id.includes('node_modules')) {
              // ECharts is heavy and self-contained - safe to split
              if (id.includes('echarts')) {
                return 'echarts';
              }
              if (id.includes('primevue')) {
                return 'primevue';
              }
              if (id.includes('@tanstack')) {
                return 'tanstack';
              }
              if (id.includes('pinia')) {
                return 'pinia';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  },
  robots: {
    disallow: isProduction || isDevelopment ? [] : ['/'],
  },
  ...sitemap,
  ...caching,
});
