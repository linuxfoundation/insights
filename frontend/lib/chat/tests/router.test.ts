// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Router Agent Tests with Real AI Model Execution
 *
 * Tests router agent with actual Bedrock model and real Tinybird MCP tools
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { createAmazonBedrock, type AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock'
import { experimental_createMCPClient as createMCPClient, type LanguageModelV1 } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

import { RouterAgent } from '../agents/router'
import { RouterDecisionAction } from '../enums'
import type { ChatMessage, RouterAgentInput } from '../types'

let bedrock: AmazonBedrockProvider | null = null

describe('Router Agent', () => {
  let model: LanguageModelV1
  let mcpClient: any
  let tbTools: Record<string, any> = {}
  let toolsOverview: string = ''

  beforeAll(async () => {
    // Check if we have the required environment variables
    const tinybirdToken = process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN
    const tinybirdBaseUrl = process.env.NUXT_TINYBIRD_BASE_URL
    const hasAwsCredentials = process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID

    if (!tinybirdToken || !tinybirdBaseUrl || !hasAwsCredentials) {
      console.warn('⚠️ Skipping real integration tests - missing credentials')
      console.warn(
        'Required: NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN, NUXT_TINYBIRD_BASE_URL, AWS Bedrock credentials',
      )
      return
    }

    // Initialize AWS Bedrock model exactly like DataCopilot
    bedrock = createAmazonBedrock({
      accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
      secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
      region: process.env.NUXT_AWS_BEDROCK_REGION,
    })

    // Initialize model once, like DataCopilot does in constructor
    const BEDROCK_MODEL_ID = 'us.anthropic.claude-sonnet-4-20250514-v1:0'
    model = bedrock(BEDROCK_MODEL_ID)

    // Initialize MCP client to get real tools - same as DataCopilot
    const tbMcpUrl = `https://mcp.tinybird.co?token=${tinybirdToken}&host=${tinybirdBaseUrl}`
    const url = new URL(tbMcpUrl)

    try {
      mcpClient = await createMCPClient({
        transport: new StreamableHTTPClientTransport(url, {
          sessionId: `test_session_${Date.now()}`,
        }),
      })

      // Load real tools from Tinybird MCP
      tbTools = await mcpClient.tools({})
      buildToolsOverview()

      console.warn(`✅ Connected to Tinybird MCP - ${Object.keys(tbTools).length} tools loaded`)
    } catch (error) {
      console.error('❌ Failed to connect to Tinybird MCP:', error)
      throw error
    }
  }, 30000)

  afterAll(async () => {
    if (mcpClient) {
      try {
        await mcpClient.close?.()
      } catch (error) {
        console.warn('Warning: Could not close MCP client:', error)
      }
    }
  })

  // Build tools overview exactly like DataCopilot does
  function buildToolsOverview(): void {
    const excludedFromOverview = new Set([
      'explore_data',
      'execute_query',
      'text_to_sql',
      'list_endpoints',
      'list_service_datasources',
    ])

    const toolDescriptions: string[] = []
    for (const [toolName, tool] of Object.entries(tbTools)) {
      if (excludedFromOverview.has(toolName)) continue

      const description = tool.description || tool.meta?.description || 'No description available'
      toolDescriptions.push(`- ${toolName}: ${description}`)
    }

    toolsOverview = toolDescriptions.join('\n')
  }

  function createTestInput(userQuery: string): RouterAgentInput {
    const messages: ChatMessage[] = [{ role: 'user', content: userQuery }]

    console.warn('📝 Creating test input for query:', userQuery)

    return {
      model,
      messages,
      tools: tbTools,
      toolsOverview,
      date: new Date().toISOString().slice(0, 10),
      projectName: 'test-project',
      pipe: 'test-pipe',
      parametersString: '{}',
      segmentId: 'test-segment',
    }
  }

  function skipIfNoCredentials() {
    const hasCredentials =
      process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN &&
      process.env.NUXT_TINYBIRD_BASE_URL &&
      process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID

    if (!hasCredentials) {
      console.warn('Skipping test - missing credentials')
      return true
    }
    return false
  }

  describe('Basic functionality', () => {
    test('should create original router agent successfully', () => {
      const router = new RouterAgent()
      expect(router).toBeDefined()
      expect(router.name).toBe('Router')
      expect(router.temperature).toBe(0)
    })

    test('should validate output schema for both implementations', () => {
      const originalRouter = new RouterAgent()

      const validOutput = {
        next_action: RouterDecisionAction.PIPES,
        reasoning: 'Test reasoning',
        reformulated_question: 'Test question',
        tools: ['activities_count'],
      }

      // Both should use the same schema
      expect(originalRouter.outputSchema.safeParse(validOutput).success).toBe(true)
    })

    test('should reject invalid output for both implementations', () => {
      const originalRouter = new RouterAgent()

      const invalidOutput = {
        next_action: 'INVALID_ACTION',
        reasoning: 'Test reasoning',
      }

      // Both should reject invalid output
      expect(originalRouter.outputSchema.safeParse(invalidOutput).success).toBe(false)
    })

    test('should connect to MCP and load tools', () => {
      if (skipIfNoCredentials()) return

      expect(Object.keys(tbTools).length).toBeGreaterThan(0)
      expect(tbTools.list_datasources).toBeDefined()
      expect(toolsOverview).toContain('activities')
    })
  })

  describe('Real AI routing decisions', () => {
    describe('PIPES routing', () => {
      test.each([
        'Show me commits this week',
        'Show me stars for the previous week',
        'Show me forks for the last year',
        'List of companies contributing in project',
      ])(
        'should route "%s" to PIPES',
        async (query) => {
          if (skipIfNoCredentials()) return

          console.warn(`🤖 Testing query: "${query}"`)
          const router = new RouterAgent()
          const input = createTestInput(query)
          const result = await router.execute(input)

          expect(result.next_action).toBe(RouterDecisionAction.PIPES)
          expect(result.reasoning).toBeTruthy()
          expect(result.reformulated_question).toBeTruthy()
          expect(Array.isArray(result.tools)).toBe(true)

          console.warn(`✅ "${query}" → ${result.next_action}`)
          console.warn(`🔍 Reasoning: ${result.reasoning}`)
        },
        15000,
      )
    })

    describe('CREATE_QUERY (TEXT_TO_SQL) routing', () => {
      test.each([
        'Show me commit activity by company over all time period',
        'Show me the total counts of each contribution type for 2024.',
      ])(
        'should route "%s" to CREATE_QUERY',
        async (query) => {
          if (skipIfNoCredentials()) return

          console.warn(`🤖 Testing query: "${query}"`)
          const router = new RouterAgent()
          const input = createTestInput(query)
          const result = await router.execute(input)

          expect(result.next_action).toBe(RouterDecisionAction.CREATE_QUERY)
          expect(result.reasoning).toBeTruthy()
          expect(result.reformulated_question).toBeTruthy()

          console.warn(`✅ "${query}" → ${result.next_action}`)
          console.warn(`🔍 Reasoning: ${result.reasoning}`)
        },
        15000,
      )
    })

    describe('STOP routing', () => {
      test.each([
        "What's the weather forecast for contributors?",
        "Show me contributors from Brazil",
      ])(
        'should route "%s" to STOP',
        async (query) => {
          if (skipIfNoCredentials()) return

          console.warn(`🤖 Testing query: "${query}"`)
          const router = new RouterAgent()
          const input = createTestInput(query)
          const result = await router.execute(input)

          expect(result.next_action).toBe(RouterDecisionAction.STOP)
          expect(result.reasoning).toBeTruthy()
          expect(result.tools).toEqual([])

          console.warn(`✅ "${query}" → ${result.next_action}`)
          console.warn(`🔍 Reasoning: ${result.reasoning}`)
        },
        15000,
      )
    })

    describe('ASK_CLARIFICATION routing', () => {
      test.each([
        "Show me the activity",
        "Give me stats for last period",
        "Show me metrics",
      ])(
        'should route "%s" to ASK_CLARIFICATION',
        async (query) => {
          if (skipIfNoCredentials()) return

          console.warn(`🤖 Testing query: "${query}"`)
          const router = new RouterAgent()
          const input = createTestInput(query)
          const result = await router.execute(input)

          expect(result.next_action).toBe(RouterDecisionAction.ASK_CLARIFICATION)
          expect(result.reasoning).toBeTruthy()
          expect(result.clarification_question).toBeTruthy()

          console.warn(`✅ "${query}" → ${result.next_action}`)
          console.warn(`🔍 Reasoning: ${result.reasoning}`)
          console.warn(`❓ Clarification: ${result.clarification_question}`)
        },
        15000,
      )
    })
  })
})
