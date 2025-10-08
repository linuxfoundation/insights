// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg'
import { RouterDecisionAction } from '~~/lib/chat/enums'

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
  routerResponse: RouterDecisionAction
  routerReason: string
  pipeInstructions?: PipeInstructions
  sqlQuery?: string
  clarificationQuestion?: string
  model: string
  inputTokens?: number
  outputTokens?: number
}

export interface IChatResponseDb {
  id: string
  created_at: Date
  created_by: string
  user_prompt: string
  router_response: RouterDecisionAction
  router_reason: string
  pipe_instructions: PipeInstructions | null
  sql_query: string | null
  clarification_question: string | null
  model: string
  input_tokens: number | null
  output_tokens: number | null
  feedback: number | null
  conversation_id: string | null

}

export class ChatRepository {
  constructor(private pool: Pool) {}

  async createInitialChatResponse(
    userPrompt: string,
    userEmail: string,
    conversationId?: string,
  ): Promise<string> {
    const query = `
      INSERT INTO chat_responses (created_by, user_prompt, conversation_id, model)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `
    const result = await this.pool.query(query, [
      userEmail,
      userPrompt,
      conversationId || null,
      'pending',
    ])
    return result.rows[0].id
  }

  async updateChatResponse(
    chatResponseId: string,
    response: Omit<ChatResponse, 'userPrompt'>,
  ): Promise<void> {
    const query = `
      UPDATE chat_responses
      SET
        router_response = $1,
        router_reason = $2,
        pipe_instructions = $3,
        sql_query = $4,
        clarification_question = $5,
        model = $6,
        input_tokens = $7,
        output_tokens = $8
      WHERE id = $9
    `
    await this.pool.query(query, [
      response.routerResponse,
      response.routerReason,
      response.pipeInstructions ? JSON.stringify(response.pipeInstructions) : null,
      response.sqlQuery,
      response.clarificationQuestion,
      response.model,
      response.inputTokens,
      response.outputTokens,
      chatResponseId,
    ])
  }

  async saveAgentStep(step: {
    chatResponseId: string
    agent: 'ROUTER' | 'PIPE' | 'TEXT_TO_SQL' | 'AUDITOR' | 'CHART' | 'EXECUTE_INSTRUCTIONS'
    model?: string
    response?: any
    inputTokens?: number
    outputTokens?: number
    responseTimeSeconds: number
    instructions?: string
    errorMessage?: string
  }): Promise<void> {
    const query = `
      INSERT INTO chat_response_agent_steps
      (chat_response_id, model, agent, response, input_tokens, output_tokens, response_time_seconds, instructions, error_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `
    await this.pool.query(query, [
      step.chatResponseId,
      step.model || null,
      step.agent,
      step.response ? JSON.stringify(step.response) : null,
      step.inputTokens || 0,
      step.outputTokens || 0,
      step.responseTimeSeconds,
      step.instructions || null,
      step.errorMessage || null,
    ])
  }

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
        clarification_question,
        model,
        input_tokens,
        output_tokens,
        feedback,
        conversation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `

      const result = await this.pool.query(query, [
        userEmail,
        response.userPrompt,
        response.routerResponse,
        response.routerReason,
        response.pipeInstructions ? JSON.stringify(response.pipeInstructions) : null,
        response.sqlQuery,
        response.clarificationQuestion,
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

  async getChatResponsesByConversation(conversationId: string): Promise<IChatResponseDb[]> {
    const query = `
      SELECT * FROM chat_responses
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `

    const result = await this.pool.query(query, [conversationId])
    return result.rows
  }
}
