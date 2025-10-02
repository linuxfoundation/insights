// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouterOutput, RouterAgentInput } from '../types'
import { routerOutputSchema } from '../types'
import { routerPrompt } from '../prompts/router'
import { BaseAgent } from './base-agent'

export class RouterAgent extends BaseAgent<RouterAgentInput, RouterOutput> {
  readonly name = 'Router'
  readonly outputSchema = routerOutputSchema
  readonly temperature = 0
  readonly maxSteps = 3 // Allow router to use list_datasources if needed

  protected getModel(input: RouterAgentInput): any {
    return input.model
  }

  protected getSystemPrompt(input: RouterAgentInput): string {
    return routerPrompt(
      input.date,
      input.projectName,
      input.pipe,
      input.parametersString,
      input.segmentId,
      input.toolsOverview,
      input.previousWasClarification,
    )
  }

  protected getUserPrompt(_input: RouterAgentInput): string {
    // Not used when messages are provided, but required by base class
    return ''
  }

  protected getTools(input: RouterAgentInput): Record<string, any> {
    // Only allow calling list_datasources; all other tools remain visible in prompt via toolsOverview
    const allowed: Record<string, any> = {}
    if (input.tools && input.tools['list_datasources']) {
      allowed['list_datasources'] = input.tools['list_datasources']
    }
    return allowed
  }

  protected createError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`Router agent error: ${error.message}`)
    }
    return new Error(`Router agent error: ${String(error)}`)
  }
}
