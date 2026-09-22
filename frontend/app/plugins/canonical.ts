// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useHead } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const route = useRoute();

  const baseUrl = config.public.appUrl as string;

  // Get the current path and remove trailing slashes for consistency,
  // combining base URL with path without double slashes
  const canonicalUrl = () => {
    const path = route.path.replace(/\/$/, '') || '';
    return `${baseUrl}${path}`;
  };

  // Watch for route changes and update canonical URL and og:url together,
  // so social crawlers always see the same URL search engines canonicalize to.
  // Repository and repository-group pages still pass ogUrl to useSeoMeta and
  // override this tag with the full path including query params - those
  // overrides should be removed when their metadata gets the same treatment.
  useHead({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl,
      },
    ],
    meta: [
      {
        property: 'og:url',
        content: canonicalUrl,
      },
    ],
  });
});
