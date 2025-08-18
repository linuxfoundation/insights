// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { streamingAgentRequestHandler } from '../../../lib/chat/data-copilot';
import { ChatRepository } from '../../repo/chat.repo';

export const maxDuration = 30;

interface IStreamRequestBody { 
    messages: any[];
    segmentId?: string;
    projectName?: string;
    pipe: string;
    parameters?: Record<string, any>;
}

export default defineEventHandler(async (event): Promise<any | Error> => {
    try {
    const { messages, segmentId, projectName, pipe, parameters } = await readBody<IStreamRequestBody>(event);

    if (!pipe) {
      return createError({statusCode: 400, statusMessage: 'Pipe is required'});
    }

    const dbPool = event.context.dbPool as Pool;

    return await streamingAgentRequestHandler({
      messages,
      segmentId,
      projectName,
      pipe,
      parameters,
      onResponseComplete: dbPool ? async (response) => {
        const chatRepo = new ChatRepository(dbPool);
        return await chatRepo.saveChatResponse(response);
      } : undefined,
    });
  } catch (error) {
    return createError({statusCode: 500, statusMessage:  error instanceof Error ? error.message : 'An error occurred processing your request'});
  }

});


