// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';

export const organizationsLeaderboardPath = '/v0/pipes/organizations_leaderboard.json';

export interface OrganizationRow {
  slug: string;
  logo: string;
  displayName: string;
  contributionCount: number;
  contributionPercentage: number;
}

export const isOrganizationRow = (row: OrganizationRow) =>
  typeof row.slug === 'string' &&
  typeof row.logo === 'string' &&
  typeof row.displayName === 'string' &&
  Number.isSafeInteger(row.contributionCount) &&
  row.contributionCount >= 0 &&
  typeof row.contributionPercentage === 'number';

export const toOrganization = (row: OrganizationRow) => ({
  name: row.displayName,
  slug: row.slug,
  logo: row.logo,
  contributions: row.contributionCount,
  contributionPercentage: row.contributionPercentage,
});

export const Organization = Type.Object({
  name: Type.String({ description: "The organization's display name." }),
  slug: Type.String({
    description:
      "The organization's slug in LFX Insights, as in its organization page URL `https://insights.linuxfoundation.org/organization/{slug}`. It can change, for example when the organization is renamed.",
  }),
  logo: Type.String({
    description: "URL of the organization's logo image. An empty string when it has none.",
  }),
  contributions: Type.Integer({
    description:
      'Contributions attributed to the organization in the period that match the filters (count).',
  }),
  contributionPercentage: Type.Number({
    description:
      "The organization's share of the contributions attributed to any organization in the period that match the filters, in percent, rounded to two decimals. Contributions without an organization are left out, so the shares of all organizations add up to about 100.",
  }),
});
