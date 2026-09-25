// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';

export const contributorsLeaderboardPath = '/v0/pipes/contributors_leaderboard.json';

export interface ContributorRow {
  id: string;
  displayName: string;
  avatar: string;
  contributionCount: number;
  contributionPercentage: number;
  roles?: string[] | null;
  githubHandleArray?: string[] | null;
}

const isOptionalStringList = (value: unknown) =>
  value === undefined ||
  value === null ||
  (Array.isArray(value) && value.every((entry) => typeof entry === 'string'));

export const isContributorRow = (row: ContributorRow) =>
  typeof row.id === 'string' &&
  typeof row.displayName === 'string' &&
  typeof row.avatar === 'string' &&
  Number.isSafeInteger(row.contributionCount) &&
  row.contributionCount >= 0 &&
  typeof row.contributionPercentage === 'number' &&
  isOptionalStringList(row.roles) &&
  isOptionalStringList(row.githubHandleArray);

// The pipe pages by count, then member id, both descending, but its final node re-sorts by count
// alone. Member ids are ASCII UUIDs in a String column, so ClickHouse compares bytes, as `<` does.
export const inLeaderboardOrder = (a: ContributorRow, b: ContributorRow) =>
  b.contributionCount - a.contributionCount || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);

export const toContributor = (row: ContributorRow) => ({
  name: row.displayName,
  avatar: row.avatar,
  contributions: row.contributionCount,
  contributionPercentage: row.contributionPercentage,
  roles: row.roles ?? [],
  githubHandles: row.githubHandleArray ?? [],
});

export const Contributor = Type.Object({
  name: Type.String({
    description:
      "The contributor's display name. For a project outside the Linux Foundation, their username instead: the one from their GitHub activity, else git, else another platform.",
  }),
  avatar: Type.String({
    description: "URL of the contributor's avatar image. An empty string when they have none.",
  }),
  contributions: Type.Integer({
    description: 'Contributions by the contributor in the period that match the filters (count).',
  }),
  contributionPercentage: Type.Number({
    description:
      "The contributor's share of all contributions in the period that match the filters, in percent, rounded to two decimals.",
  }),
  roles: Type.Array(Type.String(), {
    description:
      "Roles the contributor holds in the project's repositories, or only in `repos` when given: `maintainer` or `contributor`, as read from files such as MAINTAINERS, CODEOWNERS and CONTRIBUTORS. A role counts whatever the period, including one that has ended. Empty when they hold none.",
  }),
  githubHandles: Type.Array(Type.String(), {
    description: "The contributor's verified GitHub usernames. Empty when they have none.",
  }),
});
