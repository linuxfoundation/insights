// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { ControlResult, enumGuard } from '../../../lib/security.js';
import { nullableString, ProjectSlugParams } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/security_and_best_practices.json';

type Result = typeof ControlResult.static;

interface PipeAssessment {
  requirementId: string;
  description: string;
  message: string;
  result: Result;
  recommendation?: string;
}

interface Row {
  evaluationId: string;
  category: string;
  repo: string;
  controlId: string;
  message: string;
  result: Result;
  assessments: PipeAssessment[];
}

// The pipe keeps this order in an internal node, so it is repeated here.
const categoryOrder = [
  'Access Control',
  'Build and Release',
  'Documentation',
  'Governance',
  'Legal',
  'Quality',
  'Security Assessment',
  'Vulnerability Management',
];

const isResult = enumGuard(ControlResult);
const isString = (value: unknown) => typeof value === 'string';
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isAssessment = (value: unknown) =>
  isObject(value) &&
  isString(value.requirementId) &&
  isString(value.description) &&
  isString(value.message) &&
  isResult(value.result) &&
  (value.recommendation === undefined || isString(value.recommendation));

const isRow = (row: Row) =>
  isObject(row) &&
  isString(row.evaluationId) &&
  isString(row.category) &&
  isString(row.repo) &&
  isString(row.controlId) &&
  isString(row.message) &&
  isResult(row.result) &&
  Array.isArray(row.assessments) &&
  row.assessments.every(isAssessment);

const toAssessment = (assessment: PipeAssessment) => ({
  ...assessment,
  recommendation: assessment.recommendation || null,
});

const toItem = (row: Row) => ({ ...row, assessments: row.assessments.map(toAssessment) });

const rank = (category: string) => {
  const index = categoryOrder.indexOf(category);
  return index === -1 ? categoryOrder.length : index;
};

const compareCharCodes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const compareRows = (a: Row, b: Row) =>
  rank(a.category) - rank(b.category) ||
  compareCharCodes(a.category, b.category) ||
  compareCharCodes(a.repo, b.repo) ||
  compareCharCodes(a.controlId, b.controlId);

const Query = Type.Object({
  repos: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'Repository URLs to filter by. Each must match a repository URL exactly, as `repo` returns it.',
    }),
  ),
});

const Assessment = Type.Object({
  requirementId: Type.String({
    description: 'Identifier of the OSPS Baseline requirement, such as `OSPS-AC-01.01`.',
  }),
  description: Type.String({ description: 'What the requirement asks for.' }),
  message: Type.String({ description: 'Outcome of the check against this requirement.' }),
  result: ControlResult,
  recommendation: nullableString('How to meet the requirement. `null` when the check gives none.'),
});

const Assessments = Type.Object({
  data: Type.Array(
    Type.Object({
      evaluationId: Type.String({ description: 'Identifier of this control evaluation.' }),
      category: Type.String({
        description:
          'Control category, such as `Access Control` or `Vulnerability Management`, as the Security tab groups them.',
      }),
      repo: Type.String({ description: 'URL of the evaluated repository.' }),
      controlId: Type.String({
        description: 'Identifier of the OSPS Baseline control, such as `OSPS-AC-01`.',
      }),
      message: Type.String({ description: 'Summary of the control evaluation.' }),
      result: ControlResult,
      assessments: Type.Array(Assessment, {
        description: 'One entry per requirement of the control that was checked.',
      }),
    }),
    {
      description:
        'One entry per repository and control, sorted by category in the Security tab order, then `repo`, then `controlId`. Empty for an unknown project.',
    },
  ),
});

const assessmentRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/security/assessment',
    {
      schema: {
        tags: ['Security'],
        summary: 'Get security assessment',
        description:
          'Returns the OpenSSF OSPS Baseline control evaluations of the project repositories, with the result of each requirement check. The categories follow the Security tab order: Access Control, Build and Release, Documentation, Governance, Legal, Quality, Security Assessment, then Vulnerability Management. A category outside that list sorts after them. Within a category, entries are sorted by `repo`, then `controlId`, comparing character codes. The whole list comes in one response. An unknown project returns an empty `data` list.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: Assessments },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos } = request.query;

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<Row>(
          request,
          pipePath,
          { project: slug, bucketId, repos: repoFilter(repos) },
          isRow,
        ),
      );
      if (!rows) {
        return { data: [] };
      }

      return { data: rows.sort(compareRows).map(toItem) };
    },
  );
};

export default assessmentRoutes;
