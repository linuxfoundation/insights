// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// URL slugs that differ from the leaderboard key (the key is also the Tinybird `leaderboardType`).
const slugByKey: Record<string, string> = {
  organizations: 'companies',
  'active-organizations': 'active-companies',
};

const keyBySlug = Object.fromEntries(Object.entries(slugByKey).map(([key, slug]) => [slug, key]));

export const leaderboardSlug = (key: string): string => slugByKey[key] ?? key;

export const leaderboardKeyFromSlug = (slug: string): string => keyBySlug[slug] ?? slug;
