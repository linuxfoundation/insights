// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { experimental_createMCPClient as createMCPClient, type LanguageModelV1 } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { Pool } from 'pg'
import type { ChatResponse, IChatResponseDb } from '../../server/repo/chat.repo'
import { ChatRepository } from '../../server/repo/chat.repo'

import { TextToSqlAgent, PipeAgent, RouterAgent, AuditorAgent } from './agents'
import { executePipeInstructions, executeTextToSqlInstructions } from './instructions'
import type {
  AgentResponseCompleteParams,
  AuditorAgentInput,
  ChatMessage,
  DataCopilotQueryInput,
  PipeAgentInput,
  PipeAgentStreamInput,
  PipeInstructions,
  RouterAgentInput,
  RouterOutput,
  TextToSqlAgentInput,
  TextToSqlAgentStreamInput,
} from './types'
import { RouterDecisionAction, StreamDataStatus, StreamDataType } from './enums'
import { generateDataSummary } from './utils/data-summary'

const bedrock = createAmazonBedrock({
  accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
  region: process.env.NUXT_AWS_BEDROCK_REGION,
})

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>

type TbTools = Record<
  string,
  {
    description?: string
    meta?: { description?: string }
    inputSchema?: unknown
    parameters?: unknown
    schema?: unknown
    [key: string]: unknown // Allow additional properties
  }
>

export class DataCopilot {
  /** MCP client for communicating with Tinybird services */
  private mcpClient!: MCPClient

  /** Available Tinybird tools loaded from MCP server */
  private tbTools: TbTools = {}

  /** Human-readable overview of tools for router agent decision making */
  private toolsOverview: string = ''

  /** Tinybird MCP server URL */
  private tbMcpUrl: string = ''

  /** Amazon Bedrock language model instance */
  private model: LanguageModelV1

  /** Bedrock model identifier */
  private readonly BEDROCK_MODEL_ID = 'us.anthropic.claude-sonnet-4-20250514-v1:0'

  /** Maximum number of auditor retry attempts */
  private readonly MAX_AUDITOR_RETRIES = 1

  constructor() {
    this.model = bedrock(this.BEDROCK_MODEL_ID)
    this.tbMcpUrl = `https://mcp.tinybird.co?token=${process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN}&host=${process.env.NUXT_TINYBIRD_BASE_URL}`
  }

  /**
   * Initialize MCP client connection and load Tinybird tools
   */
  async initialize(): Promise<void> {
    const url = new URL(this.tbMcpUrl)

    this.mcpClient = await createMCPClient({
      transport: new StreamableHTTPClientTransport(url, {
        sessionId: `session_${Date.now()}`,
      }),
    })

    this.tbTools = await this.mcpClient.tools({})
    this.buildToolsOverview()
  }

  /**
   * Build human-readable overview of available tools for the router agent
   */
  private buildToolsOverview(): void {
    const excludedFromOverview = new Set([
      'explore_data',
      'execute_query',
      'text_to_sql',
      'list_endpoints',
      'list_service_datasources',
    ])

    this.toolsOverview = Object.entries(this.tbTools)
      .filter(([name]) => !excludedFromOverview.has(name))
      .map(([name, def]: [string, TbTools[string]]) => {
        try {
          const description = def?.description || def?.meta?.description || ''
          const inputSchema = def?.inputSchema || def?.parameters || def?.schema || undefined
          const params = inputSchema ? JSON.stringify(inputSchema, null, 2) : undefined
          return [`- ${name}: ${description}`, params ? `  params: ${params}` : undefined]
            .filter(Boolean)
            .join('\n')
        } catch {
          return `- ${name}`
        }
      })
      .join('\n')
  }

  /**
   * Save chat response to database
   */
  private async saveChatResponse(
    response: ChatResponse,
    insightsDbPool: Pool,
    userEmail: string,
  ): Promise<string> {
    const chatRepo = new ChatRepository(insightsDbPool)
    return await chatRepo.saveChatResponse(response, userEmail)
  }

  /**
   * Executes the router agent to analyze user queries and determine the optimal processing strategy.
   * The router acts as the decision-making component that routes requests to either SQL generation
   * or data pipeline processing based on query complexity and intent.
   *
   * @param messages - User conversation history providing context for the query
   * @param date - Current date string for time-based query filtering
   * @param projectName - Project identifier for data scoping and access control
   * @param pipe - Main data endpoint or pipeline identifier
   * @param parametersString - Additional query parameters serialized as JSON
   * @param segmentId - Data segment filter for multi-tenant data access
   * @returns Router decision with next action, reasoning, and selected tools
   */
  private async runRouterAgent({
    messages,
    date,
    projectName,
    pipe,
    parametersString,
    segmentId,
    previousWasClarification,
  }: Omit<RouterAgentInput, 'toolsOverview' | 'model' | 'tools'>) {
    const agent = new RouterAgent()
    return agent.execute({
      model: this.model,
      messages,
      tools: this.tbTools,
      toolsOverview: this.toolsOverview,
      date,
      projectName,
      pipe,
      parametersString,
      segmentId,
      previousWasClarification,
    })
  }

  /**
   * Executes the text-to-SQL agent to convert natural language questions into executable SQL queries.
   * This agent understands database schemas, applies proper filtering, and generates optimized queries
   * for direct data access when users need raw data rather than processed analytics.
   *
   * @param messages - Original conversation context for understanding query intent
   * @param date - Current date for constructing time-based WHERE conditions
   * @param projectName - Project context for database table scoping
   * @param pipe - Data source identifier for table selection
   * @param parametersString - Additional query parameters for filtering
   * @param segmentId - Segment identifier for multi-tenant data filtering
   * @param reformulatedQuestion - Clarified question from router agent for better SQL generation
   * @returns SQL query string with explanation and token usage metrics
   */
  private async runTextToSqlAgent({
    messages,
    date,
    projectName,
    pipe,
    parametersString,
    segmentId,
    reformulatedQuestion,
  }: TextToSqlAgentInput) {
    const followUpTools = this.tbTools
    delete followUpTools['execute_query']

    const agent = new TextToSqlAgent()
    return agent.execute({
      model: this.model,
      messages,
      tools: followUpTools,
      date,
      projectName,
      pipe,
      parametersString,
      segmentId,
      reformulatedQuestion,
    })
  }

  /**
   * Executes the pipe agent to generate tinybird pipeline instructions.
   * This agent designs multi-step workflows that use one or more tinybird pipes.
   * Each pipe is used to answer specific parts of the user's analytical question.
   *
   * @param messages - Original conversation context for understanding analytical requirements
   * @param date - Current date for time-based data filtering in pipeline steps
   * @param projectName - Project identifier for data access and pipeline scoping
   * @param pipe - Primary pipeline identifier for data source selection
   * @param parametersString - Additional processing parameters for pipeline configuration
   * @param segmentId - Segment filter for multi-tenant pipeline execution
   * @param reformulatedQuestion - Refined analytical question from router agent
   * @param toolNames - Selected Tinybird tools for pipeline construction (e.g., aggregation, transformation tools)
   * @returns Pipeline instructions with processing steps, column definitions, and explanation
   */
  private async runPipeAgent({
    messages,
    date,
    projectName,
    pipe,
    parametersString,
    segmentId,
    reformulatedQuestion,
    toolNames,
  }: Omit<PipeAgentInput, 'model' | 'tools'>) {
    const followUpTools: Record<string, unknown> = {}
    for (const toolName of toolNames) {
      if (this.tbTools[toolName]) {
        followUpTools[toolName] = this.tbTools[toolName]
      }
    }
    const agent = new PipeAgent()
    return agent.execute({
      model: this.model,
      messages,
      tools: followUpTools,
      date,
      projectName,
      pipe,
      parametersString,
      segmentId,
      reformulatedQuestion,
      toolNames,
    })
  }

  /**
   * Executes the auditor agent to validate whether retrieved data actually answers the user's question.
   * Uses statistical analysis of data structure and content without requiring full dataset transmission.
   *
   * @param messages - Conversation history for context
   * @param originalQuestion - The user's original question
   * @param reformulatedQuestion - Router's enhanced interpretation of the question
   * @param data - Retrieved data to validate
   * @param attemptNumber - Current retry attempt (0 for first attempt)
   * @param previousFeedback - Feedback from previous auditor run if this is a retry
   * @returns Validation result with summary or feedback for router
   */
  private async runAuditorAgent({
    messages,
    originalQuestion,
    reformulatedQuestion,
    data,
    attemptNumber,
    previousFeedback,
  }: Omit<AuditorAgentInput, 'model' | 'dataSummary'> & { data: any[] }) {
    const dataSummary = generateDataSummary(data)
    const agent = new AuditorAgent()
    return agent.execute({
      model: this.model,
      messages,
      originalQuestion,
      reformulatedQuestion,
      dataSummary,
      attemptNumber,
      previousFeedback,
    })
  }

  /**
   * Run execution and validation loop with auditor feedback
   * Handles router execution, query/pipes execution, validation, and retries
   *
   * @returns Router action and results after validation
   */
  private async runExecutionWithAuditorLoop({
    messages,
    currentQuestion,
    date,
    projectName,
    pipe,
    parametersString,
    segmentId,
    previousWasClarification,
    dataStream,
    responseData,
  }: {
    messages: ChatMessage[]
    currentQuestion: string
    date: string
    projectName: string
    pipe: string
    parametersString: string
    segmentId: string
    previousWasClarification: boolean
    dataStream: any
    responseData: ChatResponse
  }): Promise<{
    action: RouterDecisionAction
    routerOutput: RouterOutput
    sqlQuery?: string
    pipeInstructions?: PipeInstructions
  }> {
    let attemptNumber = 0
    let previousFeedback: string | undefined = undefined
    let currentMessages = messages
    let routerOutput: RouterOutput
    let sqlQuery: string | undefined = undefined
    let pipeInstructions: PipeInstructions | undefined = undefined

    while (attemptNumber <= this.MAX_AUDITOR_RETRIES) {
      // Run router agent
      dataStream.writeData({
        type: StreamDataType.ROUTER_STATUS,
        status: StreamDataStatus.ANALYZING,
      })

      routerOutput = await this.runRouterAgent({
        messages: currentMessages,
        date,
        projectName,
        pipe,
        parametersString,
        segmentId,
        previousWasClarification: attemptNumber === 0 ? previousWasClarification : false,
      })

      // Accumulate router token usage
      if (routerOutput.usage) {
        responseData.inputTokens += routerOutput.usage.promptTokens || 0
        responseData.outputTokens += routerOutput.usage.completionTokens || 0
      }

      // Handle STOP and ASK_CLARIFICATION - no auditor needed
      if (
        routerOutput.next_action === RouterDecisionAction.STOP ||
        routerOutput.next_action === RouterDecisionAction.ASK_CLARIFICATION
      ) {
        return { action: routerOutput.next_action, routerOutput }
      }

      // Router decided on CREATE_QUERY or PIPES - continue with execution
      dataStream.writeData({
        type: StreamDataType.ROUTER_STATUS,
        status: StreamDataStatus.COMPLETE,
        reasoning: routerOutput.reasoning,
        reformulatedQuestion: routerOutput.reformulated_question,
      })

      let data: any[] = []

      // Execute based on router decision
      if (routerOutput.next_action === RouterDecisionAction.CREATE_QUERY) {
        const result = await this.handleCreateQueryAction({
          messages: currentMessages,
          date,
          projectName,
          pipe,
          parametersString,
          segmentId,
          reformulatedQuestion: routerOutput.reformulated_question,
          dataStream,
        })
        sqlQuery = result.sqlQuery
        data = result.data
      } else if (routerOutput.next_action === RouterDecisionAction.PIPES) {
        const result = await this.handlePipesAction({
          messages: currentMessages,
          date,
          projectName,
          pipe,
          parametersString,
          segmentId,
          reformulatedQuestion: routerOutput.reformulated_question,
          toolNames: routerOutput.tools,
          dataStream,
          responseData,
          routerOutput,
        })
        pipeInstructions = result.pipeInstructions
        data = result.data
      }

      // Stream auditor status
      dataStream.writeData({
        type: StreamDataType.AUDITOR_STATUS,
        status: attemptNumber === 0 ? StreamDataStatus.VALIDATING : StreamDataStatus.RETRYING,
        attempt: attemptNumber + 1,
        maxAttempts: this.MAX_AUDITOR_RETRIES + 1,
      })

      // Run auditor validation
      const auditorResult = await this.runAuditorAgent({
        messages: currentMessages,
        originalQuestion: currentQuestion,
        reformulatedQuestion: routerOutput.reformulated_question,
        data,
        attemptNumber,
        previousFeedback,
      })

      // Accumulate auditor token usage
      if (auditorResult.usage) {
        responseData.inputTokens += auditorResult.usage.promptTokens || 0
        responseData.outputTokens += auditorResult.usage.completionTokens || 0
      }

      if (auditorResult.is_valid) {
        // Data is valid, stream summary and exit loop
        dataStream.writeData({
          type: StreamDataType.AUDITOR_STATUS,
          status: StreamDataStatus.VALIDATED,
          summary: auditorResult.summary,
          reasoning: auditorResult.reasoning,
        })
        return { action: routerOutput.next_action, routerOutput, sqlQuery, pipeInstructions }
      }

      // Data is invalid
      if (attemptNumber >= this.MAX_AUDITOR_RETRIES) {
        // Max retries reached, send final status
        dataStream.writeData({
          type: StreamDataType.AUDITOR_STATUS,
          status: StreamDataStatus.MAX_RETRIES,
          feedback: auditorResult.feedback_to_router,
          reasoning: auditorResult.reasoning,
        })
        return { action: routerOutput.next_action, routerOutput, sqlQuery, pipeInstructions }
      }

      // Prepare for retry - add feedback to messages and loop
      previousFeedback = auditorResult.feedback_to_router
      attemptNumber++

      dataStream.writeData({
        type: StreamDataType.AUDITOR_STATUS,
        status: StreamDataStatus.RETRYING,
        feedback: previousFeedback,
        attempt: attemptNumber + 1,
      })

      // Add feedback to conversation context for next iteration
      currentMessages = [
        ...currentMessages,
        {
          role: 'system',
          content: `Previous attempt did not produce valid results. Auditor feedback: ${previousFeedback}. \n
                    Please adjust your approach based on this feedback.`,
        },
      ]
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Auditor loop completed without returning a result')
  }

  /**
   * Send keepalive message to prevent Cloudflare timeout
   */
  private sendKeepalive(dataStream: any, message: string): void {
    dataStream.writeData({
      type: 'keepalive',
      message,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Send progress update message
   */
  private sendProgress(dataStream: any, status: string, message: string): void {
    dataStream.writeData({
      type: StreamDataType.ROUTER_STATUS,
      status: 'progress',
      message,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Build messages array from conversation history
   * Handles clarification merging if the previous response was ASK_CLARIFICATION
   */
  private async buildMessagesFromConversation(
    currentQuestion: string,
    conversationId: string | undefined,
    insightsDbPool: Pool,
  ): Promise<{ messages: ChatMessage[]; previousWasClarification: boolean }> {
    const chatRepo = new ChatRepository(insightsDbPool)

    if (!conversationId) {
      // No conversation history, just return the current question
      return {
        messages: [{ role: 'user', content: currentQuestion }],
        previousWasClarification: false,
      }
    }

    const previousChatResponses = await chatRepo.getChatResponsesByConversation(conversationId)

    if (previousChatResponses.length === 0) {
      // No previous responses in this conversation
      return {
        messages: [{ role: 'user', content: currentQuestion }],
        previousWasClarification: false,
      }
    }

    // Check if the latest response was ASK_CLARIFICATION
    const latestResponse = previousChatResponses[previousChatResponses.length - 1] as IChatResponseDb
    const previousWasClarification =
      latestResponse.router_response === RouterDecisionAction.ASK_CLARIFICATION

    if (previousWasClarification) {
      // Merge the clarification: combine the ambiguous question with the clarification answer
      const ambiguousQuestion = latestResponse.user_prompt
      const mergedQuestion = `Original question: ${ambiguousQuestion}\n\nClarification provided: ${currentQuestion}`

      // Build messages: [older history before clarification] + [merged question]
      const messages = previousChatResponses.slice(0, -1).map((response) => ({
        role: 'user' as const,
        content: response.user_prompt,
      }))

      // Add the merged question as the current message
      messages.push({
        role: 'user',
        content: mergedQuestion,
      })

      return { messages, previousWasClarification: true }
    }

    // Normal case: build messages from all previous responses + current question
    const messages = previousChatResponses.map((response) => ({
      role: 'user' as const,
      content: response.user_prompt,
    }))

    // Add the current question
    messages.push({
      role: 'user',
      content: currentQuestion,
    })

    return { messages, previousWasClarification: false }
  }

  /**
   * Main streaming handler that orchestrates the entire AI agent workflow
   */
  async streamingAgentRequestHandler({
    currentQuestion,
    segmentId,
    projectName,
    pipe,
    parameters,
    conversationId,
    insightsDbPool,
    userEmail,
    dataStream,
  }: DataCopilotQueryInput): Promise<void> {
    const parametersString = JSON.stringify(parameters || {})
    const date = new Date().toISOString().slice(0, 10)

    // Build messages from conversation history
    const { messages, previousWasClarification } = await this.buildMessagesFromConversation(
      currentQuestion,
      conversationId,
      insightsDbPool,
    )

    const responseData: ChatResponse = {
      userPrompt: currentQuestion,
      inputTokens: 0,
      outputTokens: 0,
      model: this.BEDROCK_MODEL_ID,
      conversationId: conversationId || '',
      routerResponse: RouterDecisionAction.STOP,
      routerReason: '',
      pipeInstructions: undefined as PipeInstructions | undefined,
      sqlQuery: undefined as string | undefined,
    }

    try {
      // Run execution with auditor loop (handles router, execution, validation, retries)
      const { action, routerOutput, sqlQuery, pipeInstructions } =
        await this.runExecutionWithAuditorLoop({
          messages,
          currentQuestion,
          date,
          projectName: projectName as string,
          pipe,
          parametersString,
          segmentId: segmentId as string,
          previousWasClarification,
          dataStream,
          responseData,
        })

      // Handle STOP and ASK_CLARIFICATION actions
      if (action === RouterDecisionAction.STOP) {
        await this.handleStopAction(
          messages[messages.length - 1]?.content || '',
          routerOutput,
          responseData,
          dataStream,
          insightsDbPool,
          userEmail,
          conversationId,
        )
        return
      }

      if (action === RouterDecisionAction.ASK_CLARIFICATION) {
        await this.handleAskClarificationAction(
          messages[messages.length - 1]?.content || '',
          routerOutput,
          responseData,
          dataStream,
          insightsDbPool,
          userEmail,
          conversationId,
        )
        return
      }

      // Handle completed execution (CREATE_QUERY or PIPES)
      await this.handleResponseComplete({
        userPrompt: messages[messages.length - 1]?.content || '',
        responseData,
        routerOutput,
        pipeInstructions,
        sqlQuery,
        conversationId,
        insightsDbPool,
        userEmail,
        dataStream,
      })
    } catch (error) {
      dataStream.writeData({
        type: 'router-status',
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Handle router 'stop' action - send final response without further processing
   */
  private async handleStopAction(
    userPrompt: string,
    routerOutput: RouterOutput,
    responseData: ChatResponse,
    dataStream: any,
    insightsDbPool: Pool,
    userEmail: string,
    conversationId?: string,
  ): Promise<void> {
    dataStream.writeData({
      type: StreamDataType.ROUTER_STATUS,
      status: StreamDataStatus.COMPLETE,
      reasoning: routerOutput.reasoning,
    })

    const chatResponseId = await this.saveChatResponse(
      {
        userPrompt,
        inputTokens: responseData.inputTokens,
        outputTokens: responseData.outputTokens,
        routerResponse: RouterDecisionAction.STOP,
        routerReason: routerOutput.reasoning,
        pipeInstructions: undefined,
        sqlQuery: undefined,
        model: this.BEDROCK_MODEL_ID,
        conversationId: conversationId,
      },
      insightsDbPool,
      userEmail,
    )

    dataStream.writeData({
      type: StreamDataType.CHAT_RESPONSE_ID,
      id: chatResponseId,
      conversationId: conversationId || '',
    })
  }

  /**
   * Handle router 'ask_clarification' action - ask user for clarification
   */
  private async handleAskClarificationAction(
    userPrompt: string,
    routerOutput: RouterOutput,
    responseData: ChatResponse,
    dataStream: any,
    insightsDbPool: Pool,
    userEmail: string,
    conversationId?: string,
  ): Promise<void> {
    dataStream.writeData({
      type: StreamDataType.ROUTER_STATUS,
      status: StreamDataStatus.ASK_CLARIFICATION,
      question: routerOutput.clarification_question,
      reasoning: routerOutput.reasoning,
    })

    const chatResponseId = await this.saveChatResponse(
      {
        userPrompt,
        inputTokens: responseData.inputTokens,
        outputTokens: responseData.outputTokens,
        routerResponse: RouterDecisionAction.ASK_CLARIFICATION,
        routerReason: routerOutput.reasoning,
        clarificationQuestion: routerOutput.clarification_question || undefined,
        pipeInstructions: undefined,
        sqlQuery: undefined,
        model: this.BEDROCK_MODEL_ID,
        conversationId: conversationId,
      },
      insightsDbPool,
      userEmail,
    )

    dataStream.writeData({
      type: StreamDataType.CHAT_RESPONSE_ID,
      id: chatResponseId,
      conversationId: conversationId || '',
    })
  }

  /**
   * Handle router 'create_query' action - generate and execute SQL query
   */
  private async handleCreateQueryAction({
    messages,
    date,
    projectName,
    pipe,
    parametersString,
    segmentId,
    reformulatedQuestion,
    dataStream,
  }: TextToSqlAgentStreamInput): Promise<{ sqlQuery: string; data: any[] }> {
    // Send progress update before starting TextToSql agent
    this.sendProgress(dataStream, 'progress', 'Analyzing database schema...')

    // Set up keepalive interval during long operation
    const keepaliveInterval = setInterval(() => {
      this.sendKeepalive(dataStream, 'Processing SQL query generation...')
    }, 15000) // Send keepalive every 15 seconds

    try {
      const textToSqlOutput = await this.runTextToSqlAgent({
        messages,
        date,
        projectName,
        pipe,
        parametersString,
        segmentId,
        reformulatedQuestion,
      })

      clearInterval(keepaliveInterval)
      this.sendProgress(
        dataStream,
        'progress',
        `SQL query generated! Executing [${textToSqlOutput.instructions}]...`,
      )

      const queryData = await executeTextToSqlInstructions(textToSqlOutput.instructions)

      dataStream.writeData({
        type: StreamDataType.SQL_RESULT,
        explanation: textToSqlOutput.explanation,
        instructions: textToSqlOutput.instructions,
        data: queryData,
      })

      return { sqlQuery: textToSqlOutput.instructions, data: queryData }
    } catch (error) {
      clearInterval(keepaliveInterval)
      throw error
    }
  }

  /**
   * Handle router 'pipes' action - generate and execute pipe instructions
   */
  private async handlePipesAction({
    messages,
    date,
    projectName,
    pipe,
    parametersString,
    segmentId,
    reformulatedQuestion,
    toolNames,
    dataStream,
    responseData,
  }: PipeAgentStreamInput): Promise<{ pipeInstructions: PipeInstructions; data: any[] }> {
    const pipeOutput = await this.runPipeAgent({
      messages,
      date,
      projectName,
      pipe,
      parametersString,
      segmentId: segmentId as string,
      reformulatedQuestion,
      toolNames,
    })

    // Accumulate token usage from pipe agent
    if (pipeOutput.usage) {
      responseData.inputTokens += pipeOutput.usage.promptTokens || 0
      responseData.outputTokens += pipeOutput.usage.completionTokens || 0
    }

    // Execute the pipes according to the instructions and combine results
    const combinedData = await executePipeInstructions(pipeOutput.instructions)

    dataStream.writeData({
      type: StreamDataType.PIPE_RESULT,
      explanation: pipeOutput.explanation,
      instructions: pipeOutput.instructions,
      data: combinedData,
    })

    return { pipeInstructions: pipeOutput.instructions, data: combinedData }
  }

  /**
   * Save final response to database and stream chat response ID
   */
  private async handleResponseComplete({
    userPrompt,
    responseData,
    routerOutput,
    pipeInstructions,
    sqlQuery,
    conversationId,
    insightsDbPool,
    userEmail,
    dataStream,
  }: AgentResponseCompleteParams): Promise<void> {
    const chatResponseId = await this.saveChatResponse(
      {
        userPrompt,
        inputTokens: responseData.inputTokens,
        outputTokens: responseData.outputTokens,
        routerResponse: routerOutput.next_action,
        routerReason: routerOutput.reasoning,
        pipeInstructions,
        sqlQuery,
        model: this.BEDROCK_MODEL_ID,
        conversationId: conversationId,
      },
      insightsDbPool,
      userEmail,
    )

    dataStream.writeData({
      type: StreamDataType.CHAT_RESPONSE_ID,
      id: chatResponseId,
      conversationId: conversationId || '',
    })
  }
}
