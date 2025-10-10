// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg'
import { createDataStreamResponse } from 'ai'
import { DataCopilot } from '~~/lib/chat/data-copilot'
import { InsightsProjectsRepository } from '~~/server/repo/insightsProjects.repo'

export const maxDuration = 30

interface IStreamRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  projectSlug?: string
  projectName?: string
  pipe: string
  parameters?: Record<string, unknown>
  conversationId?: string
}

export default defineEventHandler(async (event): Promise<Response | Error> => {
  // Set streaming headers for Cloudflare compatibility
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate, no-transform')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  setHeader(event, 'X-Accel-Buffering', 'no')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Connection', 'close')

  const config = useRuntimeConfig()

  try {
    const { messages, projectName, pipe, parameters, conversationId, projectSlug } =
      await readBody<IStreamRequestBody>(event)

    if (!projectSlug) {
      return createError({ statusCode: 400, statusMessage: 'Project slug is required' })
    }

    const question = messages?.filter((m) => m.role === 'user').pop()?.content

    if (!question) {
      return createError({ statusCode: 400, statusMessage: 'Question is required' })
    }

    // Generate conversationId if not provided
    const finalConversationId = conversationId || crypto.randomUUID()

    const insightsDbPool = event.context.insightsDbPool as Pool
    const cmDbPool = event.context.cmDbPool as Pool

    let segmentId = ''

    if (config.cmDbEnabled) {
      // find project by slug to get the segmentId
      const insightsProjectsRepo = new InsightsProjectsRepository(cmDbPool)
      const insightsProject = await insightsProjectsRepo.findInsightsProjectsBySlug(projectSlug)
      if (!insightsProject) {
        return createError({ statusCode: 404, statusMessage: 'Project not found' })
      }
      segmentId = insightsProject.segmentId
    } else {
      segmentId = config.dataCopilotDefaultSegmentId
    }

    const dataCopilot = new DataCopilot()
    await dataCopilot.initialize()

    return createDataStreamResponse({
      execute: async (dataStream) => {
        await dataCopilot.streamingAgentRequestHandler({
          currentQuestion: question,
          segmentId: segmentId,
          projectName,
          pipe,
          parameters,
          conversationId: finalConversationId,
          insightsDbPool,
          userEmail: event.context.user.email,
          dataStream,
        })
      },
    })
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : 'An error occurred processing your request',
    })
  }
})
