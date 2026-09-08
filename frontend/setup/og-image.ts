// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export default {
  // Use compatibility mode to prevent resvg crashes from taking down the app
  compatibility: {
    runtime: {
      resvg: 'node',
      satori: 'node',
    },
  },
  // Applied to every OG image at render time (nuxt-og-image merges `defaults` server-side)
  defaults: {
    // Cache strategy: cache OG images for 24 hours
    // This reduces rendering load from repeated bot crawler requests
    cacheMaxAgeSeconds: 60 * 60 * 24, // 24 hours in seconds
    // nuxt-og-image v6 dropped the module-level `fonts` option in favour of @nuxt/fonts.
    // Per-image font definitions still load the self-hosted TTFs from public/fonts, which
    // keeps OG rendering independent from how the app itself loads fonts.
    fonts: [
      {
        name: 'Inter',
        weight: 400,
        path: '/fonts/Inter-Regular.ttf',
      },
      {
        name: 'Roboto Slab',
        weight: 300,
        path: '/fonts/RobotoSlab-Light.ttf',
      },
      {
        name: 'Roboto Slab',
        weight: 400,
        path: '/fonts/RobotoSlab-Regular.ttf',
      },
      {
        name: 'Roboto Slab',
        weight: 700,
        path: '/fonts/RobotoSlab-Bold.ttf',
      },
    ],
  },
};
