// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const longCache = 86400; // 1 day in seconds
const shortCache = 3600; // 1 hour in seconds

// Production runs on node:24-slim (Debian, glibc) — only the linux-x64-gnu native
// binary is ever loaded at runtime. Nitro's dependency tracer (nitropack >=2.13)
// full-traces every @resvg/resvg-js-* platform package it finds (Windows/macOS/
// Android/musl included), ballooning the server bundle from ~80MB to ~440MB.
// Known upstream issue: https://github.com/nuxt-modules/og-image/issues/412
const externals = {
  traceOptions: {
    ignore: [
      '**/node_modules/@resvg/resvg-js-android-arm-eabi/**',
      '**/node_modules/@resvg/resvg-js-android-arm64/**',
      '**/node_modules/@resvg/resvg-js-darwin-arm64/**',
      '**/node_modules/@resvg/resvg-js-darwin-x64/**',
      '**/node_modules/@resvg/resvg-js-linux-arm-gnueabihf/**',
      '**/node_modules/@resvg/resvg-js-linux-arm64-musl/**',
      '**/node_modules/@resvg/resvg-js-linux-x64-musl/**',
      '**/node_modules/@resvg/resvg-js-win32-arm64-msvc/**',
      '**/node_modules/@resvg/resvg-js-win32-ia32-msvc/**',
      '**/node_modules/@resvg/resvg-js-win32-x64-msvc/**',
    ],
  },
};

export default {
  routeRules: {
    '/auth/callback': { redirect: '/api/auth/callback' },
    '/callback': { redirect: '/api/auth/callback' },
    '/api/auth/**': { prerender: false, index: false, cache: false },
    '/__og-image__/**': { cache: false },
    '/api/**/*.post': { cache: false },
    '/api/**/*.put': { cache: false },
    '/api/**/*.delete': { cache: false },
    '/api/**/*.patch': { cache: false },
    ...(process.env.NUXT_APP_ENV === 'production'
      ? {
          '/api/health': { cache: false },
          '/api/chat/**': { cache: false },
          '/api/health/live': { cache: false },
          '/api/health/ready': { cache: false },
          '/api/report': { cache: false },
          '/api/report/cncf/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/report/ai-code-tracker/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/report/cncf': { cache: { maxAge: longCache, base: 'redis' } },
          '/report/ai-code-tracker': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/security/**': { cache: false },
          '/api/collection': { cache: false },
          '/api/collection/**': { cache: false },
          '/api/community/list': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/community/**': { cache: false },
          '/api/search': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/category': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/explore/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/leaderboard': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/leaderboard/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/project': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/project/collections': { cache: false },
          '/api/repository/collections': { cache: false },
          '/api/ossindex': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/leaderboard': { cache: { maxAge: longCache, base: 'redis' } },
          '/leaderboard/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/project/**': { cache: false },
          '/collection/**': { cache: false },
          '/collection': { cache: false },
          '**': { cache: { maxAge: longCache, base: 'redis' } },
        }
      : {}),
  },
  nitro: {
    externals,
    storage: {
      redis: {
        driver: 'redis',
        url: process.env.NUXT_REDIS_URL || '',
      },
    },
    routeRules: {
      '/api/**': {
        headers: { 'cache-control': 's-maxage=0' },
        prerender: false,
      },
    },
  },
};
