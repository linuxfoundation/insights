// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';
import redirectMap from '../../shared/collection-redirects.json';

const COLLECTION_DETAILS_PREFIX = '/collection/details/';

// NOTE: Temporary client-side redirect to handle legacy collection slugs.
// TODO: Remove this middleware once we have permissions for bulk redirects in Cloudflare.
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith(COLLECTION_DETAILS_PREFIX)) return;

  const slug = to.path.slice(COLLECTION_DETAILS_PREFIX.length);
  if (!slug || !(slug in redirectMap)) return;

  const newSlug = redirectMap[slug as keyof typeof redirectMap];
  return navigateTo(
    { path: `${COLLECTION_DETAILS_PREFIX}${newSlug}`, query: to.query },
    { redirectCode: 301 },
  );
});
