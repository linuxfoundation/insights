// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

const COLLECTION_DETAILS_PREFIX = '/collection/details/';

// NOTE: Temporary client-side redirect to handle legacy collection slugs.
// TODO: Remove this middleware once we have permissions for bulk redirects in Cloudflare.
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith(COLLECTION_DETAILS_PREFIX)) return;

  const slug = to.path.slice(COLLECTION_DETAILS_PREFIX.length);
  if (!slug) return;

  const redirectModule = await import('../../shared/collection-redirects.json');
  const redirectMap = redirectModule.default as Record<string, string>;
  if (!(slug in redirectMap)) return;

  const newSlug = redirectMap[slug];
  return navigateTo(
    { path: `${COLLECTION_DETAILS_PREFIX}${newSlug}`, query: to.query },
    { redirectCode: 301 },
  );
});
