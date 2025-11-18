// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const longCache = 86400; // 1 day in seconds
const shortCache = 3600; // 1 hour in seconds

export default {
  routeRules: {
    '/auth/callback': { redirect: '/api/auth/callback' },
    '/callback': { redirect: '/api/auth/callback' },
    '/api/auth/**': { prerender: false, index: false, cache: false },
    ...(process.env.NUXT_APP_ENV === 'production'
      ? {
          '/api/health': { cache: false },
          '/api/chat/**': { cache: false },
          '/api/health/live': { cache: false },
          '/api/seo/og-image': { cache: false },
          '/api/report': { cache: false },
          '/api/community/**': { cache: false },
          '/api/search': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/category': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/collection': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/explore/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/leaderboard': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/leaderboard/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/project': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/ossindex': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/leaderboard': { cache: { maxAge: longCache, base: 'redis' } },
          '/leaderboard/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/project/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/collection/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/collection': { cache: { maxAge: shortCache, base: 'redis' } },
          '**': { cache: { maxAge: longCache, base: 'redis' } },
        }
      : {}),
  },
  nitro: {
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
