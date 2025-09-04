// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const longCache = 86400 // 1 day in seconds
const shortCache = 3600 // 1 hour in seconds

export default {
  routeRules:
    process.env.NUXT_APP_ENV === 'production'
      ? {
          '/callback': { redirect: '/auth/auth0/callback' }, // Redirect legacy callback to OIDC callback
          '/auth/callback': { redirect: '/auth/auth0/callback' }, // Redirect legacy callback to OIDC callback
          // '/auth/callback': { ssr: false, cache: false }, // Disable SSR for Auth0 callback page
          // '/auth/auth0/callback': { ssr: false, cache: false }, // Disable SSR for OIDC callback page
          '/api/health': { cache: false },
          '/api/chat/**': { cache: false },
          '/api/health/live': { cache: false },
          '/api/seo/og-image': { cache: false },
          '/api/report': { cache: false },
          '/api/search': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/category': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/collection': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/explore/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/project': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/ossindex': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/project/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/collection/**': { cache: { maxAge: shortCache, base: 'redis' } },
          '/collection': { cache: { maxAge: shortCache, base: 'redis' } },
          '**': { cache: { maxAge: longCache, base: 'redis' } },
        }
      : {
          '/callback': { redirect: '/auth/auth0/callback' }, // Redirect legacy callback to OIDC callback
          '/auth/callback': { redirect: '/auth/auth0/callback' }, // Redirect legacy callback to OIDC callback
          // '/auth/callback': { ssr: false, cache: false }, // Disable SSR for Auth0 callback page in development too
          // '/auth/auth0/callback': { ssr: false, cache: false }, // Disable SSR for OIDC callback page in development too
        },
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        url: process.env.NUXT_REDIS_URL || '',
      },
      oidc: {
        driver: 'redis',
        url: process.env.NUXT_REDIS_URL || '',
      },
    },
  },
}
