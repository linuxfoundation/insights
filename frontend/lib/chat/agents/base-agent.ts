// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod'
import { generateText } from 'ai'
import { extractJSON } from 'extract-first-json'

export abstract class BaseAgent<TInput, TOutput> {
  abstract readonly name: string
  abstract readonly outputSchema: z.ZodSchema<TOutput>
  abstract readonly temperature: number
  abstract readonly maxSteps: number

  protected generateConversationHistoryReceipt(input: TInput): string {
    try {
      const conversationHistory = this.getConversationHistory(input)
      
      if (!conversationHistory || conversationHistory.trim() === '') {
        return ''
      }

      return `
      
      ## CONVERSATION HISTORY (FOR CONTEXT ONLY)

      The following is the conversation history leading up to the current question. \n\n
      Use this ONLY for context and understanding. Do NOT attempt to answer previous questions.

      ${conversationHistory}

      ## END OF CONVERSATION HISTORY`
    } catch (error) {
      console.error('Error generating conversation history context', error)
      return ''
    }
  }

  /**
   * Generates JSON format instructions based on the Zod schema
   */
  protected generateJSONInstructions(): string {
    try {
      const schemaShape = this.getSchemaShape(this.outputSchema)
      return `\n\n## OUTPUT FORMAT\nReturn your response as a JSON object with this exact structure:\n${JSON.stringify(
        schemaShape,
        null,
        2,
      )}\n\nDo not include any other text in your response, only the JSON object.
      DO NOT make any other comments.
      The response MUST be directly parseable with JSON.parse() without any additional parsing.
      DO NOT add explanations around the JSON object. No text before or after the JSON object.`
    } catch (error) {
      console.error('Error generating JSON instructions', error)
      return '\n\nReturn your response as a valid JSON object.'
    }
  }

  /**
   * Extracts the shape of a Zod schema for documentation
   */
  private getSchemaShape(schema: z.ZodSchema<any>): any {
    if (schema instanceof z.ZodObject) {
      const shape: any = {}
      const schemaShape = (schema as any).shape

      for (const key in schemaShape) {
        const field = schemaShape[key]
        if (field instanceof z.ZodString) {
          shape[key] = field.description || 'string'
        } else if (field instanceof z.ZodNumber) {
          shape[key] = field.description || 'number'
        } else if (field instanceof z.ZodBoolean) {
          shape[key] = field.description || 'boolean'
        } else if (field instanceof z.ZodArray) {
          const elementType = this.getFieldDescription(field._def.type)
          shape[key] = field.description || `array of ${elementType}`
        } else if (field instanceof z.ZodEnum) {
          const values = (field as any)._def.values
          shape[key] = field.description || `one of: ${values.join(' | ')}`
        } else if (field instanceof z.ZodOptional || field instanceof z.ZodNullable) {
          const innerType = (field as any)._def.innerType
          shape[key] = `${this.getFieldDescription(innerType)} (optional)`
        } else if (field instanceof z.ZodAny) {
          shape[key] = field.description || 'any value'
        } else {
          shape[key] = field.description || 'value'
        }
      }

      return shape
    }

    return {}
  }

  private getFieldDescription(field: any): string {
    if (field instanceof z.ZodString) return 'string'
    if (field instanceof z.ZodNumber) return 'number'
    if (field instanceof z.ZodBoolean) return 'boolean'
    if (field instanceof z.ZodAny) return 'any'
    return 'value'
  }

  async execute(input: TInput): Promise<TOutput & { usage?: any }> {
    try {
      const systemPrompt = await this.getSystemPrompt(input)
      const userPrompt = this.getUserPrompt(input)
      const tools = this.getTools(input)

      // Append JSON format instructions to system prompt
      const jsonInstructions = this.generateJSONInstructions()
      const conversationHistoryReceipt = this.generateConversationHistoryReceipt(input)

      const fullSystemPrompt = conversationHistoryReceipt + systemPrompt + jsonInstructions

      // Check if we have messages in the input
       
      const hasMessages =
        typeof input === 'object' &&
        input !== null &&
        'messages' in input &&
        Array.isArray((input as any).messages)

      const generateConfig: any = {
        model: this.getModel(input),
        system: fullSystemPrompt,
        tools,
        maxSteps: this.maxSteps,
        temperature: this.temperature,
      }

      // Add any provider-specific options
      const providerOptions = this.getProviderOptions(input)
      if (providerOptions) {
        generateConfig.providerOptions = providerOptions
      }

      // Use messages if available, otherwise use prompt
      if (hasMessages) {
        generateConfig.messages = (input as any).messages
                                                .filter((msg: any) => 
                                                  msg.content && 
                                                  msg.content.trim() !== '' && 
                                                  msg.role === 'user'
                                                )
        generateConfig.messages = generateConfig.messages.slice(-1)
      } else {
        generateConfig.prompt = userPrompt
      }

      const response = await generateText(generateConfig)

      // Log tool calls if monitoring is enabled
      if (this.shouldMonitorToolCalls(input)) {
        this.logToolCalls(response)
      }

      // Extract and validate JSON from response
      const result = this.getJson(response.text)

      // Add usage information to the result
      return {
        ...result,
        usage: response.usage,
      }
    } catch (error) {
      throw this.createError(error)
    }
  }

  /**
   * Extract and validate JSON from the response text
   */
  protected getJson(text: string): TOutput {
    // First, try simple JSON.parse since the text usually contains valid JSON
    let parsedOutput
    try {
      parsedOutput = JSON.parse(text)
    } catch {
      // Fall back to extractJSON if direct parsing fails
      try {
        parsedOutput = extractJSON(text)
      } catch (error) {
        console.error(`${this.name} agent failed to parse JSON:`, error)
        console.error(`Response text:`, text)
        throw new Error(`${this.name} agent did not return valid JSON`)
      }
    }

    if (!parsedOutput) {
      console.error('No JSON found in the response')
      console.error(text)
      throw new Error(`${this.name} agent did not return valid JSON`)
    }

    // Validate against schema
    try {
      const validatedOutput = this.outputSchema.parse(parsedOutput)
      return validatedOutput
    } catch (error) {
      console.error(`Failed to validate ${this.name} JSON`, error)
      throw new Error(`Failed to validate ${this.name} JSON: ${error}`)
    }
  }

  protected abstract getModel(input: TInput): any
  protected abstract getSystemPrompt(input: TInput): string | Promise<string>
  protected abstract getUserPrompt(input: TInput): string
  protected abstract getConversationHistory(input: TInput): string
  protected abstract getTools(input: TInput): Record<string, any>
  protected abstract createError(error: unknown): Error

  /**
   * Override this method to provide provider-specific options
   */
  protected getProviderOptions(_input: TInput): any {
    return undefined
  }

  /**
   * Override this method to enable tool call monitoring
   */
  protected shouldMonitorToolCalls(_input: TInput): boolean {
    return false
  }

  /**
   * Log all tool calls with inputs and outputs from the response
   */
  protected logToolCalls(response: any): void {
    // The response from generateText contains steps array with tool calls
    if (!response.steps || response.steps.length === 0) return

    for (const step of response.steps) {
      if (step.toolCalls && step.toolCalls.length > 0) {
        for (const call of step.toolCalls) {
          const result = step.toolResults?.find((r: any) => r.toolCallId === call.toolCallId)
          console.warn(
            [
              '🛠️ Tool Call:',
              `  - Name: ${call.toolName}`,
              `  - Input: ${JSON.stringify(call.args, null, 2)}`,
              result ? `  - Output: ${JSON.stringify(result.result, null, 2)}` : undefined,
            ]
              .filter(Boolean)
              .join('\n'),
          )
        }
      }
    }
  }
}
