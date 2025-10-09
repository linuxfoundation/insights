// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { textToSqlInstructionsSchema, type SqlErrorContext } from '../types'
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
  errorContext?: SqlErrorContext
}

export class TextToSqlAgent extends BaseAgent<TextToSqlAgentInput, SqlOutput> {
  /**
   * Generate SQL query using tools and text extraction
   */
  override async execute(
    input: TextToSqlAgentInput & { messages: any[] },
  ): Promise<SqlOutput & { usage?: any }> {
    try {
      const { generateText } = await import('ai')
      const systemPrompt = this.getSystemPrompt(input)
      const tools = this.getTools(input)
      const conversationHistoryReceipt = this.generateConversationHistoryReceipt(input.messages)

      // Remove broken text_to_sql tool, keep working ones
      const workingTools = { ...tools }
      delete workingTools['text_to_sql']

      const fullSystemPrompt =
        conversationHistoryReceipt +
        systemPrompt +
        `

## CRITICAL INSTRUCTIONS
0. NEVER use the functions that are NOT provided under AVAILABLE FUNCTIONS
1. Use tools BRIEFLY to understand schema (max 2 tool calls)
2. Then STOP calling tools and write the SQL query
3. Put your SQL in a markdown code block: \`\`\`sql ... \`\`\`
4. You MUST conclude with a final SQL query - do not keep exploring!`

      const generateConfig: any = {
        model: this.getModel(input),
        system: fullSystemPrompt,
        tools: workingTools,
        maxSteps: this.maxSteps,
        temperature: this.temperature,
      }

      const providerOptions = this.getProviderOptions(input)
      if (providerOptions) {
        generateConfig.providerOptions = providerOptions
      }

      generateConfig.messages = input.messages
        .filter((msg: any) => msg.content && msg.content.trim() !== '' && msg.role === 'user')
        .slice(-1)

      const response = await generateText(generateConfig)

      if (this.shouldMonitorToolCalls(input)) {
        this.logToolCalls(response)
      }

      // Extract SQL from text response
      const result = this.extractSqlFromTextResponse(response)
      console.warn('🔍 Extracted SQL:', result.instructions)

      return {
        ...result,
        usage: response.usage,
      }
    } catch (error) {
      throw this.createError(error)
    }
  }

  /**
   * Extract SQL query from text response when tools fail
   */
  private extractSqlFromTextResponse(response: any): SqlOutput {
    const text = response.text || ''

    // Look for SQL code blocks
    const sqlBlockMatch = text.match(/```sql\n([\s\S]*?)\n```/i)
    if (sqlBlockMatch && sqlBlockMatch[1]) {
      const sqlQuery = this.cleanSqlQuery(sqlBlockMatch[1].trim())
      return {
        explanation: 'Generated SQL query based on database schema analysis',
        instructions: sqlQuery,
      }
    }

    // Look for WITH or SELECT statements in the text
    const withMatch = text.match(/\b(WITH[\s\S]*?ORDER BY[^;]*;?)/i)
    const selectMatch = text.match(/\b(SELECT[\s\S]*?ORDER BY[^;]*;?)/i)

    if (withMatch && withMatch[1]) {
      return {
        explanation: 'Extracted SQL query from agent response',
        instructions: this.cleanSqlQuery(withMatch[1].trim()),
      }
    }

    if (selectMatch && selectMatch[1]) {
      return {
        explanation: 'Extracted SQL query from agent response',
        instructions: this.cleanSqlQuery(selectMatch[1].trim()),
      }
    }

    // Fallback: look for any SQL-like content
    const generalSqlMatch = text.match(/\b((?:WITH|SELECT)[\s\S]*?)(?=\n\n|\n(?![A-Z\s,()])|$)/i)
    if (generalSqlMatch && generalSqlMatch[1]) {
      return {
        explanation: 'Extracted SQL query from agent response',
        instructions: this.cleanSqlQuery(generalSqlMatch[1].trim()),
      }
    }

    throw new Error('Could not extract SQL query from response text')
  }

  /**
   * Clean SQL query for Tinybird compatibility
   */
  private cleanSqlQuery(sql: string): string {
    // Remove SQL comments (both line and block comments)
    sql = sql.replace(/--.*$/gm, '') // Remove line comments
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments

    // Remove trailing semicolon (Tinybird doesn't allow it)
    sql = sql.replace(/;\s*$/, '')

    // Clean up extra whitespace
    sql = sql.replace(/\s+/g, ' ').trim()

    return sql
  }

  readonly name = 'SQL'
  readonly outputSchema = sqlOutputSchema
  readonly temperature = 0
  readonly maxSteps = 3

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
      input.errorContext,
    )
  }

  protected getUserPrompt(input: TextToSqlAgentInput): string {
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
        reasoningConfig: { type: 'enabled', budgetTokens: 1500 },
      },
    }
  }

  protected override shouldMonitorToolCalls(_input: TextToSqlAgentInput): boolean {
    return false
  }
}
