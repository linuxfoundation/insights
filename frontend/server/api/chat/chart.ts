// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';
import { generateChartConfig, modifyChartConfig } from '../../../lib/chat/chart/generator';
import { ChatRepository } from '../../repo/chat.repo';
import { Result, Config, DataMapping } from '../../../lib/chat/chart/types';
import { getBucketIdForProject } from '../../data/tinybird/bucket-cache';
import { fetchFromTinybird } from '../../data/tinybird/tinybird';
import { PipeInstructions } from '~~/lib/chat/types';

export const maxDuration = 30;

// Helper function to get router reasoning from conversation
async function getRouterReasoningFromConversation(
  pool: Pool,
  conversationId?: string,
): Promise<string | undefined> {
  if (!conversationId) return undefined;

  try {
    const chatRepo = new ChatRepository(pool);
    const latestResponse = await chatRepo.getLatestChatResponseByConversation(conversationId);

    return latestResponse?.routerReason || undefined;
  } catch (error) {
    console.error('Error fetching router reasoning from conversation:', error);
    return undefined;
  }
}

interface IChartRequestBody {
  results?: Result[];
  userQuery?: string;
  currentConfig?: Config;
  instructions?: string;
  pipeInstructions?: PipeInstructions;
  conversationId?: string;
}

interface ChartConfigResponse {
  success: boolean;
  isModification: boolean;
  config?: Config | null;
  dataMapping?: DataMapping[] | null;
  isMetric?: boolean;
}

export default defineEventHandler(async (event): Promise<ChartConfigResponse | Error> => {
  try {
    const { results, userQuery, currentConfig, instructions, pipeInstructions, conversationId } =
      await readBody<IChartRequestBody>(event);

    // Get router reasoning from conversation
    const routerReasoning = await getRouterReasoningFromConversation(
      event.context.insightsDbPool as Pool,
      conversationId,
    );

    // If pipe instructions are provided, execute them first to get results
    if (pipeInstructions && !results) {
      const { executePipeInstructions } = await import('../../../lib/chat/instructions');

      try {
        const project = pipeInstructions.pipes[0]?.inputs?.project as string | undefined;
        const bucketId = project ? await getBucketIdForProject(project, fetchFromTinybird) : null;
        const executedResults = await executePipeInstructions(pipeInstructions, bucketId);

        if (!userQuery) {
          return createError({
            statusCode: 400,
            statusMessage: 'User query is required for chart generation',
          });
        }

        const chartGeneration = await generateChartConfig(
          executedResults as Result[],
          userQuery,
          routerReasoning,
        );

        return {
          success: true,
          isMetric: chartGeneration.isMetric,
          config: chartGeneration.config,
          dataMapping: chartGeneration.dataMapping,
          isModification: false,
        };
      } catch (pipeError) {
        console.error('Pipe execution error:', pipeError);
        return createError({
          statusCode: 500,
          statusMessage: 'Failed to execute pipe instructions',
        });
      }
    }

    if (!results || !Array.isArray(results)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Results array or pipe instructions are required',
      });
    }

    // If we have a current config and instructions, this is a modification request
    if (currentConfig && instructions) {
      const updatedConfig = await modifyChartConfig(
        currentConfig as Config,
        results as Result[],
        instructions,
      );

      return {
        success: true,
        config: updatedConfig.config,
        isModification: true,
      };
    }

    // Otherwise, generate a new chart config
    if (!userQuery) {
      return createError({
        statusCode: 400,
        statusMessage: 'User query is required for chart generation',
      });
    }

    const chartGeneration = await generateChartConfig(
      results as Result[],
      userQuery,
      routerReasoning,
    );

    return {
      success: true,
      isMetric: chartGeneration.isMetric,
      config: chartGeneration.config,
      dataMapping: chartGeneration.dataMapping,
      isModification: false,
    };
  } catch (error) {
    console.error('Chart generation/modification error:', error);
    return createError({ statusCode: 500, statusMessage: 'Failed to process chart request' });
  }
});
