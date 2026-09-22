// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://nuxt.com/docs/api/configuration/nuxt-config

import { gtag, plausible } from './setup/analytics';
import caching from './setup/caching';
import echarts from './setup/echarts';
import head from './setup/head';
import hooks from './setup/hooks';
import image from './setup/image';
import modules from './setup/modules';
import ogImage from './setup/og-image';
import primevue from './setup/primevue';
import robots from './setup/robots';
import runtimeConfig from './setup/runtime-config';
import site from './setup/site';
import sitemap from './setup/sitemap';
import tailwindcss from './setup/tailwind';
import vite from './setup/vite';
import vue from './setup/vue';

export default defineNuxtConfig({
  hooks,
  app: {
    head,
  },
  components: false,
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  experimental: {
    typedPages: true,
  },
  modules,
  image,
  site,
  ogImage,
  plugins: [
    '~/plugins/vue-query.ts',
    '~/plugins/analytics.ts',
    '~/plugins/canonical.ts',
    '~/plugins/auth.client.ts',
    '~/plugins/intercom.ts',
  ],
  css: ['~/assets/styles/main.scss'],
  tailwindcss,
  primevue,
  echarts,
  runtimeConfig,
  vue,
  gtag,
  plausible,
  vite,
  robots,
  ...sitemap,
  ...caching,
});
