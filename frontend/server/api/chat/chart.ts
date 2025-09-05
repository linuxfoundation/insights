// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { generateChartConfig, modifyChartConfig } from '../../../lib/chat/chart/generator'
import { Result, Config, DataMapping } from '../../../lib/chat/chart/types'
import { PipeInstructions } from '~~/lib/chat/types'

export const maxDuration = 30

interface IChartRequestBody {
  results?: Result[]
  userQuery?: string
  currentConfig?: Config
  instructions?: string
  pipeInstructions?: PipeInstructions
  routerReasoning?: string
}

interface ChartConfigResponse {
  success: boolean
  isModification: boolean
  config?: Config | null
  dataMapping?: DataMapping[] | null
  isMetric?: boolean
}

export default defineEventHandler(async (event): Promise<ChartConfigResponse | Error> => {
  try {
    const { results, userQuery, currentConfig, instructions, pipeInstructions, routerReasoning } =
      await readBody<IChartRequestBody>(event)

    // If pipe instructions are provided, execute them first to get results
    if (pipeInstructions && !results) {
      const { executePipeInstructions } = await import('../../../lib/chat/instructions')

      try {
        const executedResults = await executePipeInstructions(pipeInstructions)

        if (!userQuery) {
          return createError({
            statusCode: 400,
            statusMessage: 'User query is required for chart generation',
          })
        }

        const chartGeneration = await generateChartConfig(executedResults as Result[], userQuery, routerReasoning)

        return {
          success: true,
          isMetric: chartGeneration.isMetric,
          config: chartGeneration.config,
          dataMapping: chartGeneration.dataMapping,
          isModification: false,
        }
      } catch (pipeError) {
        console.error('Pipe execution error:', pipeError)
        return createError({
          statusCode: 500,
          statusMessage: 'Failed to execute pipe instructions',
        })
      }
    }

    if (!results || !Array.isArray(results)) {
      return createError({
        statusCode: 400,
        statusMessage: 'Results array or pipe instructions are required',
      })
    }

    // If we have a current config and instructions, this is a modification request
    if (currentConfig && instructions) {
      const updatedConfig = await modifyChartConfig(
        currentConfig as Config,
        results as Result[],
        instructions,
      )

      return {
        success: true,
        config: updatedConfig.config,
        isModification: true,
      }
    }

    // Otherwise, generate a new chart config
    if (!userQuery) {
      return createError({
        statusCode: 400,
        statusMessage: 'User query is required for chart generation',
      })
    }

    const chartGeneration = await generateChartConfig(results as Result[], userQuery, routerReasoning)

    return {
      success: true,
      isMetric: chartGeneration.isMetric,
      config: chartGeneration.config,
      dataMapping: chartGeneration.dataMapping,
      isModification: false,
    }
  } catch (error) {
    console.error('Chart generation/modification error:', error)
    return createError({ statusCode: 500, statusMessage: 'Failed to process chart request' })
  }
})
