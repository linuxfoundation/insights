// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';

import { fetchPipe, type RequestLog } from '../clients/tinybird.js';
import { NotFoundError } from './errors.js';
import { isCalendarDay, toIsoUtc } from './period.js';
import { isCount, isString } from './security.js';

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
      "The organization's slug in LFX Insights, as in its organization page URL `https://insights.linuxfoundation.org/organization/{slug}`. It can change, for example when the organization is renamed. An empty string when the organization has no public page, so there is no page to link to.",
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

export const OrganizationParams = Type.Object({
  slug: Type.String({
    minLength: 1,
    description:
      "The organization's slug, as in its organization page URL `https://insights.linuxfoundation.org/organization/{slug}` and in the `slug` the organization leaderboards return.",
  }),
});

const profilePath = '/v0/pipes/org_page_profile.json';

export interface OrganizationProfileRow {
  displayName: string;
  logo: string;
  employeeCount: string;
  industry: string;
  description: string;
  website: string | null;
  domain: string | null;
  membership: string | null;
}

const isOptionalString = (value: unknown) => value === null || isString(value);

const isOrganizationProfileRow = (row: OrganizationProfileRow) =>
  isString(row.displayName) &&
  isString(row.logo) &&
  isString(row.employeeCount) &&
  isString(row.industry) &&
  isString(row.description) &&
  isOptionalString(row.website) &&
  isOptionalString(row.domain) &&
  isOptionalString(row.membership);

// The pipe has no row for an unknown slug or for an organization whose affiliation is blocked, so
// null answers both and the organization routes return 404 for them.
export async function findOrganizationProfile(
  request: RequestLog,
  slug: string,
): Promise<OrganizationProfileRow | null> {
  const [row] = await fetchPipe<OrganizationProfileRow>(
    request,
    profilePath,
    { orgSlug: slug },
    isOrganizationProfileRow,
  );
  return row ?? null;
}

export interface OrganizationYear {
  startDate: string;
  endDate: string;
  count: number;
}

// The yearly series behind the organization page charts have one row per calendar year with data,
// oldest first. An empty series is also what an unknown organization gets, which the profile tells
// apart.
export async function fetchOrganizationYears(
  request: RequestLog,
  slug: string,
  pipePath: string,
  countField: string,
): Promise<OrganizationYear[]> {
  const rows = await fetchPipe<Record<string, unknown>>(
    request,
    pipePath,
    { orgSlug: slug },
    (row) => isCalendarDay(row.startDate) && isCalendarDay(row.endDate) && isCount(row[countField]),
  );
  if (rows.length === 0 && !(await findOrganizationProfile(request, slug))) {
    throw new NotFoundError('Organization not found');
  }
  return rows.map((row) => ({
    startDate: toIsoUtc(row.startDate as string),
    endDate: toIsoUtc(row.endDate as string),
    count: row[countField] as number,
  }));
}
