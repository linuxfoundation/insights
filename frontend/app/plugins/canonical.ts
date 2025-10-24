// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useHead } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const route = useRoute();

  const baseUrl = config.public.appUrl as string;

  // Watch for route changes and update canonical URL
  useHead({
    link: [
      {
        rel: 'canonical',
        href: () => {
          // Get the current path and remove trailing slashes for consistency
          const path = route.path.replace(/\/$/, '') || '';
          // Combine base URL with path, ensuring no double slashes
          return `${baseUrl}${path}`;
        },
      },
    ],
  });
});
