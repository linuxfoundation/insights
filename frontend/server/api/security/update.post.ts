// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectTinybird } from '~~/types/project';
import {
  getTemporalClient,
  SECURITY_BEST_PRACTICES_TASK_QUEUE,
  UPSERT_OSPS_BASELINE_WORKFLOW,
  type IUpsertOSPSBaselineSecurityInsightsParams,
} from '~~/server/utils/temporal';

interface SecurityUpdateRequest {
  slug: string;
  repoUrl: string;
}

interface SecurityUpdateResponse {
  success: boolean;
  workflowId: string;
  message: string;
}

/**
 * API Endpoint: POST /api/security/update
 * Description: Triggers a security assessment update for a specific repository
 *
 * Request Body:
 * - slug (string, required): The project slug
 * - repoUrl (string, required): The repository URL to run the security assessment on
 *
 * Response:
 * - success (boolean): Whether the workflow was successfully started
 * - workflowId (string): The Temporal workflow ID
 * - message (string): Success or error message
 */
export default defineEventHandler(async (event): Promise<SecurityUpdateResponse | Error> => {
  const config = useRuntimeConfig();
  const body: SecurityUpdateRequest = await readBody(event);

  // Validate request body
  if (!body.slug) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing required field: slug is required',
    });
  }

  if (!body.repoUrl) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing required field: repoUrl is required',
    });
  }

  // Use server-side configured token
  const token = config.securityGithubToken;
  if (!token) {
    return createError({
      statusCode: 500,
      statusMessage: 'Security GitHub token is not configured on the server',
    });
  }

  console.log('[Security Update] User:', JSON.stringify(event.context.user, null, 2));

  const { slug } = body;

  try {
    // Fetch project details to get the project ID
    const projectRes = await fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
      slug,
      details: false,
    });

    if (!projectRes.data || projectRes.data.length === 0) {
      return createError({ statusCode: 404, statusMessage: 'Project not found' });
    }

    const project = projectRes.data[0];

    // Validate that the repository belongs to this project
    if (!project.repositories.includes(body.repoUrl)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Repository does not belong to this project',
      });
    }

    // Get temporal client and start the workflow
    const client = await getTemporalClient();

    const workflowParams: IUpsertOSPSBaselineSecurityInsightsParams = {
      insightsProjectId: project.id,
      insightsProjectSlug: slug,
      repoUrl: body.repoUrl,
      token,
    };

    // Use static workflowId per repo to prevent duplicate workflows for the same repo
    // WorkflowIdReusePolicy.REJECT_DUPLICATE will reject if workflow is already running
    // Sanitize repoUrl for use in workflowId (replace non-alphanumeric chars with dashes)
    const sanitizedRepo = body.repoUrl.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const workflowId = `security-update-${slug}-${sanitizedRepo}`;

    await client.workflow.start(UPSERT_OSPS_BASELINE_WORKFLOW, {
      taskQueue: SECURITY_BEST_PRACTICES_TASK_QUEUE,
      workflowId,
      workflowIdReusePolicy: 'REJECT_DUPLICATE',
      args: [workflowParams],
    });

    return {
      success: true,
      workflowId,
      message: 'Security assessment update has been triggered successfully',
    };
  } catch (err) {
    // Handle case where workflow is already running for this project
    if (err instanceof WorkflowExecutionAlreadyStartedError) {
      return createError({
        statusCode: 429,
        statusMessage:
          'A security update is already in progress for this project. Please try again later.',
      });
    }

    console.error('Error triggering security update:', err);
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to trigger security update',
    });
  }
});
