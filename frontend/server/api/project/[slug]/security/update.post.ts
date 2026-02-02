// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectTinybird } from '~~/types/project';
import {
  getTemporalClient,
  SECURITY_BEST_PRACTICES_TASK_QUEUE,
  UPSERT_OSPS_BASELINE_WORKFLOW,
  type IUpsertOSPSBaselineSecurityInsightsParams,
} from '~~/server/utils/temporal';

interface SecurityUpdateRequest {
  repoUrl: string;
}

interface SecurityUpdateResponse {
  success: boolean;
  workflowId: string;
  message: string;
}

/**
 * API Endpoint: POST /api/project/{slug}/security/update
 * Description: Triggers a security assessment update for a specific repository
 *
 * Path Parameters:
 * - slug (string, required): The project slug
 *
 * Request Body:
 * - repoUrl (string, required): The repository URL to run the security assessment on
 *
 * Response:
 * - success (boolean): Whether the workflow was successfully started
 * - workflowId (string): The Temporal workflow ID
 * - message (string): Success or error message
 */
export default defineEventHandler(async (event): Promise<SecurityUpdateResponse | Error> => {
  const config = useRuntimeConfig();
  const { slug } = event.context.params as Record<string, string>;
  const body: SecurityUpdateRequest = await readBody(event);

  // Validate request body
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

    const workflowId = `security-update-${slug}-${Date.now()}`;

    await client.workflow.start(UPSERT_OSPS_BASELINE_WORKFLOW, {
      taskQueue: SECURITY_BEST_PRACTICES_TASK_QUEUE,
      workflowId,
      args: [workflowParams],
    });

    return {
      success: true,
      workflowId,
      message: 'Security assessment update has been triggered successfully',
    };
  } catch (err) {
    console.error('Error triggering security update:', err);
    return createError({
      statusCode: 500,
      statusMessage: err instanceof Error ? err.message : 'Failed to trigger security update',
    });
  }
});
