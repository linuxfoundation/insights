// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataStreamWriter } from 'ai'
import type { Pool } from 'pg'
import { z } from 'zod'
import { RouterDecisionAction } from './enums'
import type { ChatResponse } from '~~/server/repo/chat.repo'

// ============================================
// Pipe Instruction Types
// ============================================

// Schema for individual pipe execution
export const pipeExecutionSchema = z.object({
  id: z.string().describe('Unique identifier for referencing this pipe'),
  name: z.string().describe('Actual pipe name to execute'),
  inputs: z.record(z.any()).describe('Input parameters for the pipe'),
})

// Schema for output column mapping - either direct mapping or formula
export const outputColumnSchema = z.discriminatedUnion('type', [
  // Direct column mapping from a pipe
  z.object({
    type: z.literal('direct'),
    name: z.string().describe('Column name in final output'),
    pipeId: z.string().describe('Which pipe this column comes from'),
    sourceColumn: z.string().describe('Original column name from that pipe'),
  }),
  // Formula column that computes a value from other columns
  z.object({
    type: z.literal('formula'),
    name: z.string().describe('Column name in final output'),
    formula: z.string().describe('JavaScript expression to compute the value'),
    dependencies: z
      .array(
        z.object({
          variable: z.string().describe("Variable name to use in formula (e.g., 'a', 'b')"),
          pipeId: z.string().describe('Which pipe this value comes from'),
          sourceColumn: z.string().describe('Original column name from that pipe'),
        }),
      )
      .describe('Variables that the formula depends on'),
  }),
])

// Schema for pipe instructions
export const pipeInstructionsSchema = z.object({
  pipes: z.array(pipeExecutionSchema).describe('List of pipes to execute'),
  output: z.array(outputColumnSchema).describe('Define the final output columns'),
})

// TypeScript types inferred from schemas
export type PipeExecution = z.infer<typeof pipeExecutionSchema>
export type OutputColumn = z.infer<typeof outputColumnSchema>
export type PipeInstructions = z.infer<typeof pipeInstructionsSchema>

// ============================================
// Text-to-SQL Instruction Types
// ============================================

// Schema for text-to-SQL instructions
export const textToSqlInstructionsSchema = z.string()

// TypeScript type for text-to-SQL instructions
export type TextToSqlInstructions = z.infer<typeof textToSqlInstructionsSchema>

// ============================================
// Unified Instructions Type
// ============================================

// Discriminated union for all instruction types
export const instructionsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('query'),
    instructions: textToSqlInstructionsSchema,
  }),
  z.object({
    type: z.literal('pipes'),
    instructions: pipeInstructionsSchema,
  }),
])

// TypeScript type for unified instructions
export type Instructions = z.infer<typeof instructionsSchema>

// ============================================
// Agent Output Types
// ============================================

// Router agent output schema
export const routerOutputSchema = z.object({
  next_action: z.enum([
    RouterDecisionAction.STOP,
    RouterDecisionAction.CREATE_QUERY,
    RouterDecisionAction.PIPES,
    RouterDecisionAction.ASK_CLARIFICATION,
  ]),
  reasoning: z.string().describe('Maximum 2 sentences explaining the decision'),
  reformulated_question: z.string().describe('Enhanced query with all parameters'),
  tools: z.array(z.string()).describe('Tools needed for next agent'),
  clarification_question: z
    .string()
    .optional()
    .nullable()
    .describe('Question to ask user when next_action is ASK_CLARIFICATION'),
})

// Pipe agent output schema
export const pipeOutputSchema = z.object({
  explanation: z.string().describe('Brief explanation of why these pipes answer the question'),
  instructions: pipeInstructionsSchema.describe(
    'Instructions describing how to execute pipes and combine results',
  ),
})

// Auditor agent output schema
export const auditorOutputSchema = z.object({
  is_valid: z.boolean().describe('true = data answers question, false = needs retry'),
  reasoning: z.string().describe('2-3 sentences explaining the validation decision'),
  feedback_to_router: z
    .string()
    .optional()
    .describe('If invalid, specific guidance for router to fix the issue'),
  summary: z.string().optional().describe('If valid, user-friendly summary of findings'),
})

// TypeScript types for agent outputs
export type RouterOutput = z.infer<typeof routerOutputSchema> & { usage?: any }
export type PipeOutput = z.infer<typeof pipeOutputSchema> & { usage?: any }
export type AuditorOutput = z.infer<typeof auditorOutputSchema> & { usage?: any }

// ============================================
// Agent Input Types
// ============================================

export interface ChatMessage {
  content: string
  role: string
}

export interface RouterAgentInput {
  model: any // Bedrock model instance
  messages: ChatMessage[]
  tools: Record<string, any>
  toolsOverview: string
  date: string
  projectName: string
  pipe: string
  parametersString: string
  segmentId: string | null
  previousWasClarification?: boolean
}

export interface PipeAgentStreamInput extends Omit<PipeAgentInput, 'model' | 'tools' | 'date'> {
  dataStream: DataStreamWriter
  date: string
  responseData: ChatResponse
  routerOutput: RouterOutput
}

export interface PipeAgentInput {
  model: any // Bedrock model instance
  messages: ChatMessage[]
  tools: Record<string, any> // Filtered pipe tools based on router decision
  date: string
  projectName: string
  pipe: string
  parametersString: string
  segmentId: string | null
  reformulatedQuestion: string
  toolNames: string[] // Array of tool names from router
}

export interface DataCopilotQueryInput {
  currentQuestion: string // The current user question
  segmentId?: string
  projectName?: string
  pipe: string
  parameters?: Record<string, unknown>
  conversationId: string
  insightsDbPool: Pool
  userEmail: string
  dataStream: DataStreamWriter // DataStreamWriter from AI SDK
}

export interface SqlErrorContext {
  errorMessage: string
  previousQuery: string
  attemptNumber: number
}

export interface TextToSqlAgentInput {
  messages: ChatMessage[]
  date: string
  projectName: string
  pipe: string
  parametersString: string
  segmentId: string
  reformulatedQuestion: string
  errorContext?: SqlErrorContext
}

export interface TextToSqlAgentStreamInput {
  messages: ChatMessage[]
  date: string
  projectName: string
  pipe: string
  parametersString: string
  segmentId: string
  reformulatedQuestion: string
  dataStream: any
  errorContext?: SqlErrorContext
}

export interface AuditorAgentInput {
  model: any
  messages: ChatMessage[]
  originalQuestion: string
  reformulatedQuestion: string
  dataSummary: import('./utils/data-summary').DataSummary
  attemptNumber: number
  previousFeedback?: string
}

export interface AgentResponseCompleteParams {
  userPrompt: string
  responseData: ChatResponse
  routerOutput: RouterOutput
  pipeInstructions?: PipeInstructions
  sqlQuery?: string
  conversationId?: string
  insightsDbPool: Pool
  userEmail: string
  dataStream: DataStreamWriter
}
