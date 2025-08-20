// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

export interface ChatResponse {
  createdBy: string;
  routerResponse: 'pipes' | 'text-to-sql' | 'stop';
  routerReason: string;
  pipeInstructions?: any; // JSONB for pipe instructions
  sqlQuery?: string; // SQL query for text-to-sql
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export class ChatRepository {
  constructor(private pool: Pool) {}

  async saveChatResponse(response: ChatResponse): Promise<string> {
    const query = `
      INSERT INTO chat_responses (created_by, router_response, router_reason, pipe_instructions, sql_query, model, input_tokens, output_tokens, feedback)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const result = await this.pool.query(query, [
      response.createdBy,
      response.routerResponse,
      response.routerReason,
      response.pipeInstructions ? JSON.stringify(response.pipeInstructions) : null,
      response.sqlQuery,
      response.model,
      response.inputTokens,
      response.outputTokens,
      null // feedback starts as null
    ]);
    return result.rows[0].id;
  }

  async updateChatFeedback(chatResponseId: string, feedback: number | null): Promise<boolean> {
    const query = `
      UPDATE chat_responses 
      SET feedback = $1 
      WHERE id = $2
    `;
    
    const result = await this.pool.query(query, [feedback, chatResponseId]);
    return result.rowCount > 0;
  }

  async getChatResponse(chatResponseId: string): Promise<any | null> {
    const query = `
      SELECT * FROM chat_responses WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [chatResponseId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}