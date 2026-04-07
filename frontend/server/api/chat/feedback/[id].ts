// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { ChatRepository } from '../../../repo/chat.repo';

interface IFeedbackRequestBody {
  feedback: number | null;
}

interface IFeedbackRequestResponse {
  success: boolean;
  message: string;
}

export default defineEventHandler(async (event): Promise<IFeedbackRequestResponse | Error> => {
  try {
    if (event.node.req.method !== 'PUT') {
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    const chatResponseId = getRouterParam(event, 'id');
    if (!chatResponseId) {
      throw createError({ statusCode: 400, statusMessage: 'Chat response ID is required' });
    }

    const { feedback } = await readBody<IFeedbackRequestBody>(event);

    if (feedback !== null && feedback !== 0 && feedback !== 1) {
      throw createError({ statusCode: 400, statusMessage: 'Feedback must be 0, 1, or null' });
    }

    const insightsDbPool = event.context.insightsDbPool as Pool;
    if (!insightsDbPool) {
      throw createError({ statusCode: 500, statusMessage: 'Database connection not available' });
    }

    const chatRepo = new ChatRepository(insightsDbPool);
    const updated = await chatRepo.updateChatFeedback(chatResponseId, feedback);

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Chat response not found' });
    }

    return {
      success: true,
      message: 'Feedback updated successfully',
    };
  } catch (error) {
    console.error('Error updating chat feedback:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'An error occurred updating feedback',
    });
  }
});
