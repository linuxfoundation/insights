// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { validateDocsUrl } from '~~/config/docs-url-correction';
import { createGitHubIssue, createInternalIssue } from '~~/server/data/github/github.api';
import { DocsReadinessRepository } from '~~/server/repo/docsReadiness.repo';
import {
  InsightsProjectsRepository,
  type InsightsProject,
} from '~~/server/repo/insightsProjects.repo';
import { getAuthUsername } from '~~/server/utils/common';
import { getCMDbPool } from '~~/server/utils/db';
import { logError } from '~~/server/utils/log';
import {
  buildCorrectionIssueBody,
  buildCorrectionIssueTitle,
  buildInternalIssueBody,
  parseCorrectionRequest,
} from '~~/server/utils/report';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import type { DocsCorrectionContext } from '~~/types/docs-readiness/correction.types';

const CORRECTION_LABELS = ['needs-triage', 'docs-url-correction'];
// Internal copies also carry product-support, like INTERNAL_LABELS in ./index.post.ts
const INTERNAL_LABELS = [...CORRECTION_LABELS, 'product-support'];

/**
 * API Endpoint: /api/report/docs-url-correction
 * Method: POST
 * Description: Opens a public GitHub issue asking the LF team to change the documentation URL
 * used for a project's AI documentation readiness. Login required.
 *
 * Body:
 * - projectSlug (string): The project's slug.
 * - url (string): Page the request was sent from.
 * - requestedDocsUrl (string | null): The proposed docs URL; null means "no documentation site".
 * - description (string, optional): Up to 500 characters.
 *
 * Response: The URL of the created GitHub issue.
 *
 * Errors:
 * - 400: Invalid request, or a requested URL that is not allowed
 * - 401: Authorization required
 * - 404: Project not found
 * - 500: Internal server error
 * - 502: Failed to create the GitHub issue
 * - 503: Database not available
 */
export default defineEventHandler(async (event): Promise<string> => {
  const user = event.context.user as DecodedOidcToken | undefined;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization required' });
  }

  const input = parseCorrectionRequest(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid correction request' });
  }

  if (!useRuntimeConfig().cmDbEnabled) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }
  const pool = getCMDbPool();

  let project: InsightsProject | null;
  let context: DocsCorrectionContext | null;
  try {
    [project, context] = await Promise.all([
      new InsightsProjectsRepository(pool).findInsightsProjectsBySlug(input.projectSlug),
      new DocsReadinessRepository(pool).findCorrectionContextBySlug(input.projectSlug),
    ]);
  } catch (error) {
    logError('docs-url-correction', 'Failed to load the project', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
  if (!project || !project.isLF || !context) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  const alreadyNoDocs = context.override !== null && context.override.docsUrl === null;
  let reason: string | null;
  if (input.requestedDocsUrl === null) {
    reason = alreadyNoDocs ? 'current' : null;
  } else {
    reason = validateDocsUrl(input.requestedDocsUrl, context.currentDocsUrl);
  }
  if (reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid correction request',
      data: { reason },
    });
  }

  const lfid = user.sub ? getAuthUsername(user.sub) : 'unknown';
  const email = user.email ?? 'unknown';

  const title = buildCorrectionIssueTitle(project.name);
  const issueBody = buildCorrectionIssueBody({
    projectName: project.name,
    projectSlug: input.projectSlug,
    url: input.url,
    currentDocsUrl: context.currentDocsUrl,
    requestedDocsUrl: input.requestedDocsUrl,
    description: input.description ?? '',
  });

  let issueData: Awaited<ReturnType<typeof createGitHubIssue>>;
  try {
    issueData = await createGitHubIssue(title, issueBody, CORRECTION_LABELS);
  } catch (error) {
    logError('docs-url-correction', 'Failed to create GitHub issue', error);
    throw createError({ statusCode: 502, statusMessage: 'Failed to create GitHub issue' });
  }

  // Internal copy is best-effort, as in the report route.
  try {
    await createInternalIssue(
      title,
      buildInternalIssueBody(issueBody, issueData?.html_url, lfid, email),
      INTERNAL_LABELS,
    );
  } catch (error) {
    logError('docs-url-correction', 'Failed to create internal copy of the issue', error);
  }

  return issueData?.html_url;
});
