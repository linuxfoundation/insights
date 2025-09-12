// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg'
import { DataCopilot } from '~~/lib/chat/data-copilot'
import { InsightsProjectsRepository } from '~~/server/repo/insightsProjects.repo'
import { ChatMessage } from '~~/lib/chat/types'

export const maxDuration = 30

interface IStreamRequestBody {
  messages: ChatMessage[]
  projectSlug?: string
  projectName?: string
  pipe: string
  parameters?: Record<string, unknown>
  conversationId?: string
}

export default defineEventHandler(async (event): Promise<Response | Error> => {
  // Set streaming headers immediately
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')
  
  try {
    const { messages, projectName, pipe, parameters, conversationId, projectSlug } =
      await readBody<IStreamRequestBody>(event)

    if (!pipe) {
      return createError({ statusCode: 400, statusMessage: 'Pipe is required' })
    }

    if (!projectSlug) {
      return createError({ statusCode: 400, statusMessage: 'Project slug is required' })
    }

    // Generate conversationId if not provided
    const finalConversationId = conversationId || crypto.randomUUID()

    const insightsDbPool = event.context.insightsDbPool as Pool
    const cmDbPool = event.context.cmDbPool as Pool

    // find project by slug to get the segmentId
    const insightsProjectsRepo = new InsightsProjectsRepository(cmDbPool)

    const insightsProjects = await insightsProjectsRepo.findInsightsProjectsBySlug(projectSlug)

    if (!insightsProjects) {
      return createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const dataCopilot = new DataCopilot()
    await dataCopilot.initialize()

    return dataCopilot.streamingAgentRequestHandler({
      messages,
      segmentId: insightsProjects.segmentId,
      projectName,
      pipe,
      parameters,
      conversationId: finalConversationId,
      insightsDbPool,
      userEmail: event.context.user.email,
    })
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : 'An error occurred processing your request',
    })
  }
})
