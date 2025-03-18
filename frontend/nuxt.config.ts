// https://nuxt.com/docs/api/configuration/nuxt-config

import head from './setup/head';
import tailwindcss from './setup/tailwind';
import primevue from './setup/primevue';
import echarts from './setup/echarts';

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  app: {
    head,
    errorHandler: '~/app/error.vue'
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    'nuxt-echarts',
    '@nuxtjs/storybook',
    '@nuxt/test-utils/module'
  ],
  css: ['~/assets/styles/main.scss'],
  tailwindcss,
  primevue,
  echarts,
  runtimeConfig: {
    // These are are only available on the server-side and can be overridden by the .env file
    tinybirdBaseUrl: process.env.TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co',
    tinybirdToken: process.env.TINYBIRD_TOKEN || '',
    // These are also exposed on the client-side
    public: {
      apiBase: '/api'
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => ['lfx-footer'].includes(tag),
    }
  }
});
