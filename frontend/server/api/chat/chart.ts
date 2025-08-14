// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {  generateChartConfig, modifyChartConfig  } from '../../../lib/chat/chart/generator';
import {  Result, Config  } from '../../../lib/chat/chart/types';

export const maxDuration = 30;

interface IChartRequestBody { 
    results: Result[];
    userQuery?: string;
    currentConfig?: Config;
    instructions: string;
}

export default defineEventHandler(async (event): Promise<any | Error> => {
try {
    const { results, userQuery, currentConfig, instructions } = await readBody<IChartRequestBody>(event);

    if (!results || !Array.isArray(results)) {
      return createError({statusCode: 400, statusMessage: 'Results array is required'});

    }

    // If we have a current config and instructions, this is a modification request
    if (currentConfig && instructions) {
      const updatedConfig = await modifyChartConfig(
        currentConfig as Config,
        results as Result[],
        instructions
      );

      return {
        success: true,
        config: updatedConfig,
        isModification: true,
      };
    }

    // Otherwise, generate a new chart config
    if (!userQuery) {
      return createError({statusCode: 400, statusMessage: 'User query is required for chart generation'});
    }

    const chartGeneration = await generateChartConfig(
      results as Result[],
      userQuery
    );

    return {
      success: true,
      isMetric: chartGeneration.isMetric,
      config: chartGeneration.config,
      dataMapping: chartGeneration.dataMapping,
      isModification: false,
    };
  } catch (error: any) {
    console.error("Chart generation/modification error:", error);
      return createError({statusCode: 500, statusMessage: 'Failed to process chart request'});
  }
});


