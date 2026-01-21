// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://nuxt.com/docs/api/configuration/nuxt-config

import head from './setup/head';
import tailwindcss from './setup/tailwind';
import primevue from './setup/primevue';
import echarts from './setup/echarts';
import caching from './setup/caching';
import sitemap from './setup/sitemap';
import modules from './setup/modules';
import image from './setup/image';
import ogImage from './setup/og-image';
import runtimeConfig from './setup/runtime-config';
import vite from './setup/vite';
import { gtag, plausible } from './setup/analytics';
import vue from './setup/vue';
import robots from './setup/robots';
import site from './setup/site';
import hooks from './setup/hooks';

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
  plugins: ['~/plugins/vue-query.ts', '~/plugins/analytics.ts', '~/plugins/canonical.ts'],
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
