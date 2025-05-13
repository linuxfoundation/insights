// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://nuxt.com/docs/api/configuration/nuxt-config

import head from './setup/head';
import tailwindcss from './setup/tailwind';
import primevue from './setup/primevue';
import echarts from './setup/echarts';

const isProduction = process.env.APP_ENV === 'production';
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  app: {
    head,
    errorHandler: '~/app/error.vue'
  },
  components: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    'nuxt-echarts',
    '@nuxtjs/storybook',
    'nuxt-gtag',
    '@nuxtjs/plausible',
    '@nuxtjs/robots'
  ],
  plugins: [
    '~/plugins/vue-query.ts',
  ],
  css: ['~/assets/styles/main.scss'],
  tailwindcss,
  primevue,
  echarts,
  runtimeConfig: {
    // These are are only available on the server-side and can be overridden by the .env file
    tinybirdBaseUrl: 'https://api.us-west-2.aws.tinybird.co',
    tinybirdToken: '',
    cmApiUrl: '',
    cmApiToken: '',
    jiraIssueReporterApiUrl: '',
    jiraIssueReporterApiTokenEmail: '',
    jiraIssueReporterApiToken: '',
    jiraIssueReporterProjectKey: '',

    // These are also exposed on the client-side
    public: {
      apiBase: '/api',
      appUrl: 'http://localhost:3000',
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => ['lfx-footer'].includes(tag),
    }
  },
  gtag: {
    enabled: isProduction,
    id: 'G-EB92ZZFBNS'
  },
  plausible: { // Use as fallback if no runtime config is available at runtime
    enabled: isProduction,
    domain: 'insights.linuxfoundation.org',
  },
  vite: {
    server: {
      proxy: {
        '/docs': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/docs/, '/docs')
        }
      }
    }
  },
  robots: {
    disallow: process.env.NODE_ENV === 'production' ? [] : ['/'],
  }
});
