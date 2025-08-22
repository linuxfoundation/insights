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
      console.log('Chat stream endpoint called');
      console.log('Request method:', event.node.req.method);
      console.log('Request headers:', event.node.req.headers);
      console.log('Content-Type:', event.node.req.headers['content-type']);
      console.log('Content-Length:', event.node.req.headers['content-length']);
      
      let body;
      try {
        body = await readBody<IStreamRequestBody>(event);
        console.log('Request body:', body);
        console.log('Body type:', typeof body);
        console.log('Body keys:', body ? Object.keys(body) : 'No keys');
      } catch (readBodyError) {
        console.error('Error reading body:', readBodyError);
        console.error('ReadBody error type:', typeof readBodyError);
        console.error('ReadBody error message:', readBodyError instanceof Error ? readBodyError.message : readBodyError);
        throw readBodyError;
      }
      
      if (!body) {
        console.error('Request body is undefined or null');
        return createError({statusCode: 400, statusMessage: 'Request body is required'});
      }
      
      const { messages, segmentId, projectName, pipe, parameters } = body;
      console.log('Destructured values:', { messages: messages?.length, segmentId, projectName, pipe, parameters });

    if (!pipe) {
      console.error('Pipe parameter is missing');
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
        return await chatRepo.saveChatResponse(response, event.context.user.email);
      } : undefined,
    });
  } catch (error) {
    console.error('Chat stream error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return createError(
        {
          statusCode: 500,
          statusMessage:  error instanceof Error ? error.message : 'An error occurred processing your request'
        }
    );
  }

});


