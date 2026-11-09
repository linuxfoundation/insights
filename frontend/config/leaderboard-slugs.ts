// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// URL slugs that differ from the leaderboard key (the key is also the Tinybird `leaderboardType`).
const slugByKey: Record<string, string> = {
  organizations: 'companies',
  'active-organizations': 'active-companies',
};

const keyBySlug: Record<string, string> = Object.fromEntries(
  Object.entries(slugByKey).map(([key, slug]) => [slug, key]),
);

export const leaderboardSlug = (key: string): string =>
  Object.hasOwn(slugByKey, key) ? slugByKey[key]! : key;

export const leaderboardKeyFromSlug = (slug: string): string =>
  Object.hasOwn(keyBySlug, slug) ? keyBySlug[slug]! : slug;

// Old leaderboard URL segments (any case) that now redirect to a company slug.
export const legacyLeaderboardSlug = (segment: string): string | undefined => {
  const key = segment.toLowerCase();
  return Object.hasOwn(slugByKey, key) ? slugByKey[key] : undefined;
};
