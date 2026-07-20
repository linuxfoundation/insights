// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import slugify from 'slugify';

export const generateSlug = (name: string): string => slugify(name, { lower: true, strict: true });

export const isLocal =
  process.env.NUXT_APP_ENV != 'staging' && process.env.NUXT_APP_ENV != 'production';

export function getAuthUsername(sub: string): string {
  return sub.includes('|') ? sub.split('|').pop()! : sub;
}

export function getBooleanQueryParam(
  query: Record<string, unknown>,
  key: string,
  defaultValue: boolean,
): boolean {
  const value = query[key];

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  // If multiple values are passed (?foo=true&foo=false), let's use the first one.
  if (Array.isArray(value)) {
    return value[0].toLowerCase() === 'true';
  }

  return Boolean(value);
}

export type WidgetScope =
  | { project: string; collectionSlug?: undefined }
  | { project?: undefined; collectionSlug: string };

/**
 * Every /api/widget/... route is scoped to either a single project or a whole collection,
 * never both - this mirrors the project/collectionSlug branch already present on the
 * Tinybird pipes themselves (segments_filtered vs segments_filtered_by_collection).
 */
function asSingleTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function getWidgetScope(query: Record<string, unknown>): WidgetScope {
  // Reject anything but a single non-empty string per key (e.g. ?project=a&project=b
  // arrives here as an array and must not silently pass as a valid scope).
  if (Array.isArray(query.project) || Array.isArray(query.collectionSlug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'project and collectionSlug must each be a single value',
    });
  }

  const project = asSingleTrimmedString(query.project);
  const collectionSlug = asSingleTrimmedString(query.collectionSlug);

  if (!!project === !!collectionSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Exactly one of project or collectionSlug is required',
    });
  }

  return project ? { project } : { collectionSlug: collectionSlug! };
}
