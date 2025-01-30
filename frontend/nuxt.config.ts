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
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@primevue/nuxt-module',
    'nuxt-echarts',
    '@nuxtjs/storybook'
  ],
  css: ['~/assets/styles/main.scss'],
  tailwindcss,
  primevue,
  echarts
});
