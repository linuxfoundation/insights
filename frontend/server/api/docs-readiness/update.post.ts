// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { WorkflowExecutionAlreadyStartedError } from '@temporalio/client';

import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import {
  getTemporalClient,
  DOCS_READINESS_TASK_QUEUE,
  PROCESS_PROJECT_DOCS_READINESS_WORKFLOW,
  type IProcessProjectDocsReadinessParams,
} from '~~/server/utils/temporal';
import type { ProjectTinybird } from '~~/types/project';

interface DocsReadinessUpdateRequest {
  slug: string;
}

interface DocsReadinessUpdateResponse {
  success: boolean;
  workflowId: string;
  message: string;
}

export default defineEventHandler(async (event): Promise<DocsReadinessUpdateResponse | Error> => {
  const body: DocsReadinessUpdateRequest = await readBody(event);

  if (!body?.slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required field: slug is required',
    });
  }

  const { slug } = body;
  const workflowId = `docs-readiness-update-${slug}`;

  try {
    const projectRes = await fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
      slug,
      details: false,
    });

    if (!projectRes.data || projectRes.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' });
    }

    const project = projectRes.data[0];

    const client = await getTemporalClient();

    const workflowParams: IProcessProjectDocsReadinessParams = {
      projectId: project.id,
    };

    // Use static workflowId per project so concurrent triggers for the same project collide.
    // workflowIdConflictPolicy: 'FAIL' rejects only when a workflow with this ID is currently
    // running; once the previous run has closed, the ID can be reused for a fresh update.
    await client.workflow.start(PROCESS_PROJECT_DOCS_READINESS_WORKFLOW, {
      taskQueue: DOCS_READINESS_TASK_QUEUE,
      workflowId,
      workflowIdReusePolicy: 'ALLOW_DUPLICATE',
      workflowIdConflictPolicy: 'FAIL',
      args: [workflowParams],
    });

    return {
      success: true,
      workflowId,
      message: 'Docs readiness update has been triggered successfully',
    };
  } catch (err) {
    if (err instanceof WorkflowExecutionAlreadyStartedError) {
      throw createError({
        statusCode: 429,
        statusMessage:
          'A docs readiness update is already in progress for this project. Please try again later.',
      });
    }

    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }

    console.error(`Error triggering docs readiness update (workflowId: ${workflowId}):`, err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to trigger docs readiness update',
    });
  }
});
