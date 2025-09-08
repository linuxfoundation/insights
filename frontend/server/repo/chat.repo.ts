// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg'

export interface PipeInput {
  endDate?: string
  project?: string
  startDate?: string
  granularity?: string
  [key: string]: unknown
}

export interface Pipe {
  id: string
  name: string
  inputs: PipeInput
}

export interface DirectColumn {
  name: string
  type: 'direct'
  pipeId: string
  sourceColumn: string
}

export interface Formula {
  type: 'formula'
  name: string
  formula: string
  dependencies: {
    pipeId: string
    sourceColumn: string
    variable: string
  }[]
}

export type OutputColumn = DirectColumn | Formula

export interface PipeInstructions {
  pipes: Pipe[]
  output: OutputColumn[]
}

export interface ChatResponse {
  id?: string
  conversationId?: string
  userPrompt: string
  routerResponse: 'pipes' | 'text-to-sql' | 'stop'
  routerReason: string
  pipeInstructions?: PipeInstructions
  sqlQuery?: string
  model: string
  inputTokens?: number
  outputTokens?: number
}

export class ChatRepository {
  constructor(private pool: Pool) {}

  async saveChatResponse(response: ChatResponse, userEmail: string): Promise<string> {
    try {
      const query = `
      INSERT INTO chat_responses 
      ( 
        created_by, 
        user_prompt,
        router_response, 
        router_reason, 
        pipe_instructions, 
        sql_query, 
        model, 
        input_tokens, 
        output_tokens, 
        feedback,
        conversation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `

      const result = await this.pool.query(query, [
        userEmail,
        response.userPrompt,
        response.routerResponse,
        response.routerReason,
        response.pipeInstructions ? JSON.stringify(response.pipeInstructions) : null,
        response.sqlQuery,
        response.model,
        response.inputTokens,
        response.outputTokens,
        null,
        response.conversationId,
      ])

      return result.rows[0].id
    } catch (error) {
      console.error('Error saving chat response:', error)
      throw new Error('Could not save chat response')
    }
  }

  async updateChatFeedback(chatResponseId: string, feedback: number | null): Promise<boolean> {
    const query = `
      UPDATE chat_responses 
      SET feedback = $1 
      WHERE id = $2
    `

    const result = await this.pool.query(query, [feedback, chatResponseId])
    return (result?.rowCount || 0) > 0
  }

  async getChatResponse(chatResponseId: string): Promise<ChatResponse | null> {
    const query = `
      SELECT * FROM chat_responses WHERE id = $1
    `

    const result = await this.pool.query(query, [chatResponseId])
    return result.rows.length > 0 ? result.rows[0] : null
  }

  async getLatestChatResponseByConversation(conversationId: string): Promise<ChatResponse | null> {
    const query = `
      SELECT * FROM chat_responses 
      WHERE conversation_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    const result = await this.pool.query(query, [conversationId])
    return result.rows.length > 0 ? result.rows[0] : null
  }
}
