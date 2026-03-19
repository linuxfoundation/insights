// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { sendRedirect } from 'h3';
import redirectMap from '../../config/collection-redirects.json';

const COLLECTION_DETAILS_PREFIX = '/collection/details/';

// NOTE: Temporary client-side redirect to handle legacy collection slugs.
// TODO: Remove this middleware once we have permissions for bulk redirects in Cloudflare.
export default defineEventHandler((event) => {
  const url = event.node.req.url || '';
  const [path, query] = url.split('?'); // capture query

  if (!path.startsWith(COLLECTION_DETAILS_PREFIX)) return;

  const slug = path.slice(COLLECTION_DETAILS_PREFIX.length);
  if (!slug || !(slug in redirectMap)) return;

  const newSlug = redirectMap[slug as keyof typeof redirectMap];
  const target = query
    ? `${COLLECTION_DETAILS_PREFIX}${newSlug}?${query}`
    : `${COLLECTION_DETAILS_PREFIX}${newSlug}`;

  return sendRedirect(event, target, 301);
});
