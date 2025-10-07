// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const isLocal =
  process.env.NUXT_APP_ENV != 'staging' && process.env.NUXT_APP_ENV != 'production'

export function getBooleanQueryParam(query: Record<string, unknown>, key: string, defaultValue: boolean): boolean {
  const value = query[key];

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  // If multiple values are passed (?foo=true&foo=false), let's use the first one.
  if (Array.isArray(value)) {
    return value[0].toLowerCase() === "true";
  }

  return Boolean(value);
}
