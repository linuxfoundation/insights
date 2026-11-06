// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { isError } from 'h3';
import { Pool } from 'pg';

import { generateChartConfig, modifyChartConfig } from '../../../lib/chat/chart/generator';
import { Result, Config, DataMapping } from '../../../lib/chat/chart/types';
import { ChatRepository } from '../../repo/chat.repo';

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
    const { results, userQuery, currentConfig, instructions, conversationId } =
      await readBody<IChartRequestBody>(event);

    // Get router reasoning from conversation
    const routerReasoning = await getRouterReasoningFromConversation(
      event.context.insightsDbPool as Pool,
      conversationId,
    );

    if (!results || !Array.isArray(results)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Results array is required',
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
      throw createError({
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
    if (isError(error)) throw error;
    console.error('Chart generation/modification error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to process chart request' });
  }
});
