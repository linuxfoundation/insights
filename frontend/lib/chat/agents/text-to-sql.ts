// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod'
import { textToSqlInstructionsSchema } from '../types'
import { textToSqlPrompt } from '../prompts/text-to-sql'
import { BaseAgent } from './base-agent'

// Output schema for SQL agent
export const sqlOutputSchema = z.object({
  explanation: z.string().describe('Brief explanation of why this query answers the question'),
  instructions: textToSqlInstructionsSchema.describe(
    'Instructions containing the SQL query to execute',
  ),
})

export type SqlOutput = z.infer<typeof sqlOutputSchema>

interface TextToSqlAgentInput {
  model: any // Bedrock model instance
  messages: any[]
  tools: Record<string, any> // list_datasources and execute_query
  date: string
  projectName: string
  pipe: string
  parametersString: string
  segmentId: string | null
  reformulatedQuestion: string
}

export class TextToSqlAgent extends BaseAgent<TextToSqlAgentInput, SqlOutput> {
  readonly name = 'SQL'
  readonly outputSchema = sqlOutputSchema
  readonly temperature = 0
  readonly maxSteps = 10 // Allow multiple steps for SQL generation and execution

  protected getModel(input: TextToSqlAgentInput): any {
    return input.model
  }

  protected getSystemPrompt(input: TextToSqlAgentInput): string {
    return textToSqlPrompt(
      input.date,
      input.projectName,
      input.pipe,
      input.parametersString,
      input.segmentId,
      input.reformulatedQuestion,
    )
  }

  protected getUserPrompt(input: TextToSqlAgentInput): string {
    // Not used when messages are provided, but required by base class
    return input.reformulatedQuestion
  }

  protected getTools(input: TextToSqlAgentInput): Record<string, any> {
    return input.tools
  }

  protected createError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`SQL agent error: ${error.message}`)
    }
    return new Error(`SQL agent error: ${String(error)}`)
  }

  protected override getProviderOptions(_input: TextToSqlAgentInput): any {
    return {
      bedrock: {
        reasoningConfig: { type: 'enabled', budgetTokens: 3000 },
      },
    }
  }

  protected override shouldMonitorToolCalls(_input: TextToSqlAgentInput): boolean {
    return true // Enable tool call monitoring for SQL agent
  }

  /**
   * Override to add validation for text_to_sql tool calls
   */
  protected override logToolCalls(response: any): void {
    // Call parent method first to get normal logging
    super.logToolCalls(response)

    // Add validation for text_to_sql tool calls
    if (!response.steps || response.steps.length === 0) return

    for (const step of response.steps) {
      if (step.toolCalls && step.toolCalls.length > 0) {
        for (const call of step.toolCalls) {
          if (call.toolName === 'text_to_sql') {
            const question = call.args?.question || ''
            
            // Check if the question looks like SQL code (basic heuristic)
            if (this.looksLikeSQL(question)) {
              console.error(`❌ WARNING: text_to_sql tool called with SQL code instead of natural language question:`)
              console.error(`Question: ${question}`)
              console.error('text_to_sql tool should receive natural language questions, not SQL code')
              // Don't throw error, just warn - allow the process to continue
            }
          }
        }
      }
    }
  }

  /**
   * Basic heuristic to detect if a string looks like SQL code
   */
  private looksLikeSQL(text: string): boolean {
    // More specific SQL patterns that indicate actual SQL code, not natural language
    const sqlPatterns = [
      /^\s*SELECT\s+/i,           // Starts with SELECT
      /\bFROM\s+\w+\s*$/i,        // Ends with FROM table
      /\bSELECT\s+.*\s+FROM\s+/i, // Contains SELECT ... FROM pattern
      /\bWITH\s+\w+\s+AS\s*\(/i,  // CTE pattern WITH name AS (
      /\bUNION\s+(ALL\s+)?SELECT/i, // UNION SELECT pattern
    ]
    
    // Check for actual SQL structure patterns
    return sqlPatterns.some(pattern => pattern.test(text))
  }
}
