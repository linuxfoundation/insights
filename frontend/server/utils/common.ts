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
