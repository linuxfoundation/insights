// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { nullObject, OverviewQuery } from '../../../lib/overview.js';
import { toIsoUtc } from '../../../lib/period.js';
import { nullableDateTime, nullableNumber, ProjectSlugParams } from '../../../schemas/common.js';

const projectPath = '/v0/pipes/project_insights_health_breakdown.json';
const repoPath = '/v0/pipes/repo_health_score_v2_breakdown.json';

const numberColumns = [
  'busFactorScore',
  'busFactorCount',
  'orgDiversityScore',
  'orgCount',
  'responsivenessScore',
  'medianPrResponseS',
  'medianIssueResponseS',
  'openVulnScore',
  'openCriticals',
  'openHighs',
  'openModerates',
  'openUnknowns',
  'scorecardScorePts',
  'scorecardScore',
  'securityPracticesScore',
  'branchProtectionRequiredReviews',
  'dependencyHealthScore',
  'vulnerableDeps',
  'releaseCadenceScore',
  'daysSinceLatest',
  'daysBetweenRecent',
  'commitActivityScore',
  'commitsLast6m',
  'issueResolutionScore',
  'closed12m',
  'opened12m',
  'medianCloseS',
  'prMergeScore',
  'merged12m',
  'closedUnmerged12m',
  'medianMergeS',
] as const;

// The pipes send these as UInt8 0/1; a Bool column would arrive as true/false.
const flagColumns = [
  'busFactorAvailable',
  'orgDiversityAvailable',
  'responsivenessAvailable',
  'isGerrit',
  'isExcluded',
  'openVulnAvailable',
  'scorecardAvailable',
  'securityPracticesAvailable',
  'securityPolicyEnabled',
  'branchProtectionEnabled',
  'branchProtectionRequiresStatusChecks',
  'branchProtectionAllowsForcePush',
  'dependencyHealthAvailable',
  'releaseCadenceAvailable',
  'issueResolutionAvailable',
  'prMergeAvailable',
] as const;

type PipeFlag = 0 | 1 | boolean | null;

type Row = Record<(typeof numberColumns)[number], number | null> &
  Record<(typeof flagColumns)[number], PipeFlag> & { lastCommitAt: string | null };

const pipeTimestamp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/;
const flagValues = new Set<unknown>([0, 1, true, false, null]);

const isRow = (row: Row) =>
  typeof row === 'object' &&
  row !== null &&
  numberColumns.every((column) => row[column] === null || Number.isFinite(row[column])) &&
  flagColumns.every((column) => flagValues.has(row[column])) &&
  (row.lastCommitAt === null ||
    (typeof row.lastCommitAt === 'string' && pipeTimestamp.test(row.lastCommitAt)));

const flag = (value: PipeFlag) => (value === null ? null : Boolean(value));

const toBreakdown = (row: Row) => ({
  maintainerHealth: {
    busFactor: {
      score: row.busFactorScore,
      available: flag(row.busFactorAvailable),
      count: row.busFactorCount,
    },
    orgDiversity: {
      score: row.orgDiversityScore,
      available: flag(row.orgDiversityAvailable),
      organizationCount: row.orgCount,
    },
    responsiveness: {
      score: row.responsivenessScore,
      available: flag(row.responsivenessAvailable),
      medianPrResponseSeconds: row.medianPrResponseS,
      medianIssueResponseSeconds: row.medianIssueResponseS,
      isGerrit: flag(row.isGerrit),
      isExcluded: flag(row.isExcluded),
    },
  },
  securitySupplyChain: {
    openVulnerabilities: {
      score: row.openVulnScore,
      available: flag(row.openVulnAvailable),
      criticalCount: row.openCriticals,
      highCount: row.openHighs,
      moderateCount: row.openModerates,
      unknownCount: row.openUnknowns,
    },
    scorecard: {
      score: row.scorecardScorePts,
      available: flag(row.scorecardAvailable),
      openssfScore: row.scorecardScore,
    },
    securityPractices: {
      score: row.securityPracticesScore,
      available: flag(row.securityPracticesAvailable),
      securityPolicyEnabled: flag(row.securityPolicyEnabled),
      branchProtectionEnabled: flag(row.branchProtectionEnabled),
      branchProtectionRequiredReviews: row.branchProtectionRequiredReviews,
      branchProtectionRequiresStatusChecks: flag(row.branchProtectionRequiresStatusChecks),
      branchProtectionAllowsForcePush: flag(row.branchProtectionAllowsForcePush),
    },
    dependencyHealth: {
      score: row.dependencyHealthScore,
      available: flag(row.dependencyHealthAvailable),
      vulnerableDependencyCount: row.vulnerableDeps,
    },
  },
  developmentActivity: {
    releaseCadence: {
      score: row.releaseCadenceScore,
      available: flag(row.releaseCadenceAvailable),
      daysSinceLatestRelease: row.daysSinceLatest,
      daysBetweenRecentReleases: row.daysBetweenRecent,
    },
    commitActivity: {
      score: row.commitActivityScore,
      commitsLast6Months: row.commitsLast6m,
      lastCommitAt: row.lastCommitAt === null ? null : toIsoUtc(row.lastCommitAt),
    },
    issueResolution: {
      score: row.issueResolutionScore,
      available: flag(row.issueResolutionAvailable),
      closedLast12Months: row.closed12m,
      openedLast12Months: row.opened12m,
      medianCloseSeconds: row.medianCloseS,
    },
    pullRequestMerge: {
      score: row.prMergeScore,
      available: flag(row.prMergeAvailable),
      mergedLast12Months: row.merged12m,
      closedUnmergedLast12Months: row.closedUnmerged12m,
      medianMergeSeconds: row.medianMergeS,
    },
  },
});

const nullableBoolean = (description: string) =>
  Type.Unsafe<boolean | null>({ type: 'boolean', nullable: true, description });

const points = (max: number) =>
  nullableNumber(
    `Points of this signal, 0 to ${max}. With several repositories, the average over those where the signal is available. Null when it could not be computed.`,
  );
const Available = nullableBoolean(
  'Whether the signal could be computed. With several repositories, true when it could for any of them.',
);
const count = (what: string) =>
  nullableNumber(`${what} (count). With several repositories, the largest repository's value.`);
const seconds = (what: string) =>
  nullableNumber(`${what}, in seconds. With several repositories, the average across them.`);
const repoFlag = (what: string) =>
  nullableBoolean(`${what} With several repositories, true when it holds for any of them.`);

const Breakdown = Type.Object({
  maintainerHealth: Type.Object(
    {
      busFactor: Type.Object({
        score: points(18),
        available: Available,
        count: count('Fewest contributors who account for half of the recent activity'),
      }),
      orgDiversity: Type.Object({
        score: points(7),
        available: Available,
        organizationCount: count('Organizations with contributors in the project'),
      }),
      responsiveness: Type.Object({
        score: points(15),
        available: Available,
        medianPrResponseSeconds: seconds('Median time to the first response on a pull request'),
        medianIssueResponseSeconds: seconds('Median time to the first response on an issue'),
        isGerrit: nullableBoolean(
          'Whether the repositories are hosted on Gerrit. With several repositories, true only when every one is.',
        ),
        isExcluded: nullableBoolean(
          'Whether the repositories are excluded from the responsiveness signal. With several repositories, true only when every one is.',
        ),
      }),
    },
    { description: 'Maintainer health category, worth up to 40 points.' },
  ),
  securitySupplyChain: Type.Object(
    {
      openVulnerabilities: Type.Object({
        score: points(10),
        available: Available,
        criticalCount: count('Open vulnerabilities of critical severity'),
        highCount: count('Open vulnerabilities of high severity'),
        moderateCount: count('Open vulnerabilities of medium or low severity'),
        unknownCount: count('Open vulnerabilities with no known severity'),
      }),
      scorecard: Type.Object({
        score: points(7),
        available: Available,
        openssfScore: nullableNumber(
          'OpenSSF Scorecard score, 0 to 10. With several repositories, the average over those with a Scorecard run.',
        ),
      }),
      securityPractices: Type.Object({
        score: points(7),
        available: Available,
        securityPolicyEnabled: repoFlag('Whether a security policy is published.'),
        branchProtectionEnabled: repoFlag('Whether the default branch is protected.'),
        branchProtectionRequiredReviews: count(
          'Approving reviews the default branch requires before a merge',
        ),
        branchProtectionRequiresStatusChecks: repoFlag(
          'Whether the default branch requires status checks to pass.',
        ),
        branchProtectionAllowsForcePush: repoFlag(
          'Whether the default branch allows force pushes.',
        ),
      }),
      dependencyHealth: Type.Object({
        score: points(5),
        available: Available,
        vulnerableDependencyCount: count('Dependencies with a known vulnerability'),
      }),
    },
    {
      description:
        'Security and supply chain category, worth up to 35 points. The signal points here are raw; the category score scales them by how many signals are available.',
    },
  ),
  developmentActivity: Type.Object(
    {
      releaseCadence: Type.Object({
        score: points(8),
        available: Available,
        daysSinceLatestRelease: nullableNumber(
          'Days since the latest release. With several repositories, the smallest value.',
        ),
        daysBetweenRecentReleases: nullableNumber(
          'Days between the two most recent releases. With several repositories, the smallest value.',
        ),
      }),
      commitActivity: Type.Object({
        score: nullableNumber(
          'Points of this signal, 0 to 5. It is always computed, falling back on `lastCommitAt`. With several repositories, the average across them.',
        ),
        commitsLast6Months: count('Commits in the last 6 months'),
        lastCommitAt: nullableDateTime(
          'When the latest commit was made, in ISO 8601 UTC. With several repositories, the latest across them.',
        ),
      }),
      issueResolution: Type.Object({
        score: points(7),
        available: Available,
        closedLast12Months: count('Issues closed in the last 12 months'),
        openedLast12Months: count('Issues opened in the last 12 months'),
        medianCloseSeconds: seconds('Median time to close an issue'),
      }),
      pullRequestMerge: Type.Object({
        score: points(5),
        available: Available,
        mergedLast12Months: count('Pull requests merged in the last 12 months'),
        closedUnmergedLast12Months: count(
          'Pull requests closed without a merge in the last 12 months',
        ),
        medianMergeSeconds: seconds('Median time to merge a pull request'),
      }),
    },
    { description: 'Development activity category, worth up to 25 points.' },
  ),
});

const empty = nullObject(Breakdown);

const healthScoreBreakdownRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/overview/health-score/breakdown',
    {
      schema: {
        tags: ['Overview'],
        summary: 'Get health score breakdown',
        description:
          'Returns the eleven signals behind the three health score categories, as the Overview tab shows them: each signal with its points, whether it could be computed, and its raw inputs. Without `repos`, the values come from a nightly snapshot of the whole project. With `repos`, they are computed live for the selected repositories; archived and excluded ones are left out, and each field says how it combines several repositories. Every field is null for an unknown project, or when `repos` holds only archived or excluded repositories.',
        params: ProjectSlugParams,
        querystring: OverviewQuery,
        response: { 200: Breakdown },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const repos = repoFilter(request.query.repos);

      const rows = await withBucket(request, slug, (bucketId) =>
        repos
          ? fetchPipe<Row>(request, repoPath, { slug, bucketId, repos }, isRow)
          : fetchPipe<Row>(request, projectPath, { slug, bucketId }, isRow),
      );
      const row = rows?.[0];
      return row ? toBreakdown(row) : empty;
    },
  );
};

export default healthScoreBreakdownRoutes;
