// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg'
import { ChatRepository } from '../../../repo/chat.repo'

interface IFeedbackRequestBody {
  feedback: number | null
}

interface IFeedbackRequestResponse {
  success: boolean
  message: string
}

export default defineEventHandler(async (event): Promise<IFeedbackRequestResponse | Error> => {
  try {
    if (event.node.req.method !== 'PUT') {
      return createError({ statusCode: 405, statusMessage: 'Method not allowed' })
    }

    const chatResponseId = getRouterParam(event, 'id')
    if (!chatResponseId) {
      return createError({ statusCode: 400, statusMessage: 'Chat response ID is required' })
    }

    const { feedback } = await readBody<IFeedbackRequestBody>(event)

    if (feedback !== null && feedback !== 0 && feedback !== 1) {
      return createError({ statusCode: 400, statusMessage: 'Feedback must be 0, 1, or null' })
    }

    const dbPool = event.context.dbPool as Pool
    if (!dbPool) {
      return createError({ statusCode: 500, statusMessage: 'Database connection not available' })
    }

    const chatRepo = new ChatRepository(dbPool)
    const updated = await chatRepo.updateChatFeedback(chatResponseId, feedback)

    if (!updated) {
      return createError({ statusCode: 404, statusMessage: 'Chat response not found' })
    }

    return {
      success: true,
      message: 'Feedback updated successfully',
    }
  } catch (error) {
    console.error('Error updating chat feedback:', error)
    return createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'An error occurred updating feedback',
    })
  }
})
