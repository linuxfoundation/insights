// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { pipePages, requestedPage, toCountedPage } from '../../../lib/pagination.js';
import { toIsoUtc } from '../../../lib/period.js';
import {
  enumGuard,
  isCount,
  isString,
  Severity,
  VulnerabilityStatus,
} from '../../../lib/security.js';
import {
  nullableDateTime,
  nullableString,
  paginated,
  PaginationQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/vulnerabilities_list.json';

interface Row {
  vulnerabilityId: string;
  cveId: string;
  packageName: string;
  severity: typeof Severity.static;
  description: string;
  ecosystem: string;
  publishedAt: string | null;
  status: typeof VulnerabilityStatus.static;
  paths: string[];
  fixedVersion: string;
  referenceLink: string;
}

const isSeverity = enumGuard(Severity);
const isStatus = enumGuard(VulnerabilityStatus);
const pipeTimestamp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/;

const isRow = (row: Row) =>
  isString(row.vulnerabilityId) &&
  isString(row.cveId) &&
  isString(row.packageName) &&
  isSeverity(row.severity) &&
  isString(row.description) &&
  isString(row.ecosystem) &&
  (row.publishedAt === null ||
    (isString(row.publishedAt) && pipeTimestamp.test(row.publishedAt))) &&
  isStatus(row.status) &&
  Array.isArray(row.paths) &&
  row.paths.every(isString) &&
  isString(row.fixedVersion) &&
  isString(row.referenceLink);

interface CountRow {
  count: number;
}

const isCountRow = (row: CountRow) => isCount(row.count);

const toItem = (row: Row) => ({
  ...row,
  cveId: row.cveId || null,
  description: row.description || null,
  publishedAt: row.publishedAt === null ? null : toIsoUtc(row.publishedAt),
  fixedVersion: row.fixedVersion || null,
  referenceLink: row.referenceLink || null,
});

const Query = Type.Object({
  repos: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'Repository URLs to filter by. Each must match a repository URL exactly, as the project lists it.',
    }),
  ),
  severity: Type.Optional(Severity),
  status: Type.Optional(VulnerabilityStatus),
  ecosystem: Type.Optional(
    Type.String({
      description:
        'Package ecosystem to filter by, such as `npm` or `Go`, as `ecosystem` returns it.',
    }),
  ),
  order: Type.Optional(
    Type.Unsafe<'desc' | 'asc'>({
      type: 'string',
      enum: ['desc', 'asc'],
      default: 'desc',
      description: 'Sort by `publishedAt`: `desc` for newest first, `asc` for oldest first.',
    }),
  ),
  ...PaginationQuery.properties,
});

const Vulnerability = Type.Object({
  vulnerabilityId: Type.String({
    description: 'Identifier of the advisory, such as `GHSA-xxxx-xxxx-xxxx`.',
  }),
  cveId: nullableString('CVE identifier of the advisory. `null` when it has none.'),
  packageName: Type.String({ description: 'Name of the affected package.' }),
  severity: Severity,
  description: nullableString('Summary of the advisory. `null` when it has none.'),
  ecosystem: Type.String({ description: 'Package ecosystem, such as `npm` or `Go`.' }),
  publishedAt: nullableDateTime(
    'When the advisory was published, in ISO 8601 UTC. `null` when the advisory has no date.',
  ),
  status: VulnerabilityStatus,
  paths: Type.Array(Type.String(), {
    description: 'GitHub URLs of the manifest files that pull the package in, across repositories.',
  }),
  fixedVersion: nullableString('First package version with the fix. `null` when none exists.'),
  referenceLink: nullableString('Link to the advisory. `null` when it has none.'),
});

const Vulnerabilities = paginated(Vulnerability, {
  data: 'Up to `pageSize` vulnerabilities, one per advisory and package. An unknown project gets an empty list.',
});

const vulnerabilitiesRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/security/vulnerabilities',
    {
      schema: {
        tags: ['Security'],
        summary: 'List vulnerabilities',
        description:
          'Returns the known vulnerabilities in the package dependencies of the project repositories, one entry per advisory and package, one page at a time. ' +
          'Entries are sorted by `publishedAt`, newest first unless `order` is `asc`, then by `vulnerabilityId`; entries sharing both come in no set order. ' +
          'Archived repositories are left out. `RESOLVED` vulnerabilities are included unless `status` filters them out. ' +
          'Pages follow position, as the Pagination guide describes, and a cursor keeps its position when `pageSize` changes. ' +
          'An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: Vulnerabilities },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, severity, status, ecosystem, order = 'desc' } = request.query;
      const page = requestedPage(request.query);
      const { pages, skip } = pipePages(page);

      const result = await withBucket(request, slug, async (bucketId) => {
        const params = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          severity,
          status,
          ecosystem: ecosystem || undefined,
          orderByDirection: order,
        };
        const [counts, ...chunks] = await Promise.all([
          fetchPipe<CountRow>(request, pipePath, { ...params, count: true }, isCountRow),
          ...pages.map((number) =>
            fetchPipe<Row>(
              request,
              pipePath,
              { ...params, page: number, pageSize: page.pageSize },
              isRow,
            ),
          ),
        ]);
        return { total: counts[0]?.count ?? 0, rows: chunks.flat() };
      });
      if (!result) {
        return { data: [], pageSize: page.pageSize, nextCursor: null };
      }

      const rows = result.rows.slice(skip, skip + page.pageSize).map(toItem);
      return toCountedPage(rows, page, result.total);
    },
  );
};

export default vulnerabilitiesRoutes;
