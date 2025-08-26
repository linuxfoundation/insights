// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { experimental_createMCPClient as createMCPClient, createDataStreamResponse } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { ChatResponse } from '../../server/repo/chat.repo'

import { runRouterAgent } from './agents/router'
// TODO: Uncomment once we support text-to-sql
// import { runTextToSqlAgent } from './agents/text-to-sql';
import { runPipeAgent } from './agents/pipe'
// TODO: Uncomment once we support text-to-sql
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { executePipeInstructions, executeTextToSqlInstructions } from './instructions'
import type { ChatMessage } from './types'

const bedrock = createAmazonBedrock({
  accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
  region: process.env.NUXT_AWS_BEDROCK_REGION,
})

export async function streamingAgentRequestHandler({
  messages,
  segmentId,
  projectName,
  pipe,
  parameters,
  onResponseComplete,
}: {
  messages: ChatMessage[]
  segmentId?: string
  projectName?: string
  pipe: string
  parameters?: Record<string, unknown>
  onResponseComplete?: (response: ChatResponse) => Promise<string>
}): Promise<Response> {
  const url = new URL(
    `https://mcp.tinybird.co?token=${process.env.NUXT_INSIGHTS_DATA_COPILOT_TINYBIRD_TOKEN}&host=${process.env.NUXT_TINYBIRD_BASE_URL}`,
  )

  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(url, {
      sessionId: `session_${Date.now()}`,
    }),
  })

  const MODEL = 'us.anthropic.claude-sonnet-4-20250514-v1:0'

  const tbTools = await mcpClient.tools({})
  // Build a human-readable overview of all tools for the router's prompt (read-only catalog)
  const excludedFromOverview = new Set([
    'explore_data',
    'execute_query',
    'text_to_sql',
    'list_endpoints',
    'list_service_datasources',
  ])
  const toolsOverview = Object.entries(tbTools)
    .filter(([name]) => !excludedFromOverview.has(name))
    .map(([name, def]: [string, any]) => {
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
  const parametersString = JSON.stringify(parameters || {})
  const dateString = new Date().toISOString().split('T')[0]
  const model = bedrock(MODEL)

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const responseData = {
        question: messages[messages.length - 1]?.content || '',
        answer: '',
        reasoning: '',
        explanation: '',
        data: null as any,
        inputTokens: 0,
        outputTokens: 0,
      }

      try {
        dataStream.writeData({
          type: 'router-status',
          status: 'analyzing',
        })

        const routerOutput = await runRouterAgent({
          model,
          messages,
          tools: tbTools,
          toolsOverview,
          date: dateString as string,
          projectName: projectName as string,
          pipe,
          parametersString,
          segmentId: segmentId as string,
        })
        // Accumulate token usage from router
        if (routerOutput.usage) {
          responseData.inputTokens += routerOutput.usage.promptTokens || 0
          responseData.outputTokens += routerOutput.usage.completionTokens || 0
        }

        if (routerOutput.next_action === 'stop') {
          responseData.reasoning = `Router Decision: ${routerOutput.next_action}\nReasoning: ${routerOutput.reasoning}`
          responseData.answer = routerOutput.reasoning
          dataStream.writeData({
            type: 'router-status',
            status: 'complete',
            reasoning: routerOutput.reasoning,
          })

          if (onResponseComplete) {
            const chatResponseId = await onResponseComplete({
              userPrompt: responseData.question,
              inputTokens: responseData.inputTokens,
              outputTokens: responseData.outputTokens,
              routerResponse: 'stop',
              routerReason: routerOutput.reasoning,
              pipeInstructions: undefined,
              sqlQuery: undefined,
              model: MODEL,
            })

            // Stream the chat response ID
            dataStream.writeData({
              type: 'chat-response-id',
              id: chatResponseId,
            })
          }
          return
        }

        // TODO: Remove this once we support text-to-sql
        else if (routerOutput.next_action === 'create_query') {
          const fallbackMessage = `I'm unable to answer this question with the widgets I have access.
      But soon I will be able to construct my own queries for these questions if I have access to the necessary data.`

          responseData.answer = fallbackMessage
          responseData.reasoning = `Router Decision: ${routerOutput.next_action}\n
                                    Reasoning: ${routerOutput.reasoning}\n
                                    Fallback: Text-to-SQL not yet supported`
          dataStream.writeData({
            type: 'router-status',
            status: 'complete',
            reasoning: fallbackMessage,
          })

          if (onResponseComplete) {
            const chatResponseId = await onResponseComplete({
              userPrompt: responseData.question,
              inputTokens: responseData.inputTokens,
              outputTokens: responseData.outputTokens,
              routerResponse: 'text-to-sql',
              routerReason: routerOutput.reasoning,
              pipeInstructions: undefined,
              sqlQuery: undefined,
              model: MODEL,
            })

            // Stream the chat response ID
            dataStream.writeData({
              type: 'chat-response-id',
              id: chatResponseId,
            })
          }
          return
        }

        dataStream.writeData({
          type: 'router-status',
          status: 'complete',
          reasoning: routerOutput.reasoning,
          reformulatedQuestion: routerOutput.reformulated_question,
        })

        const followUpTools: Record<string, any> = {}
        // TODO: Uncomment once we support text-to-sql
        // if (routerOutput.next_action === "create_query") {
        followUpTools['list_datasources'] = tbTools['list_datasources']
        // TODO: Uncomment once we support text-to-sql
        // }
        // else {
        for (const toolName of routerOutput.tools) {
          if (tbTools[toolName]) {
            followUpTools[toolName] = tbTools[toolName]
          }
        }
        // TODO: Uncomment once we support text-to-sql
        // }

        // if (routerOutput.next_action === "create_query") {
        //   const textToSqlOutput = await runTextToSqlAgent({
        //     model,
        //     messages,
        //     tools: followUpTools,
        //     date: dateString as string,
        //     projectName: projectName as string,
        //     pipe,
        //     parametersString,
        //     segmentId: segmentId as string,
        //     reformulatedQuestion: routerOutput.reformulated_question,
        //   });

        //   // Execute the SQL query according to the instructions
        //   const queryData = await executeTextToSqlInstructions(textToSqlOutput.instructions);

        //   dataStream.writeData({
        //     type: "sql-result",
        //     explanation: textToSqlOutput.explanation,
        //     instructions: textToSqlOutput.instructions,
        //     data: queryData
        //   });
        // } else
        if (routerOutput.next_action === 'pipes') {
          const pipeOutput = await runPipeAgent({
            model,
            messages,
            tools: followUpTools,
            date: dateString as string,
            projectName: projectName as string,
            pipe,
            parametersString,
            segmentId: segmentId as string,
            reformulatedQuestion: routerOutput.reformulated_question,
            toolNames: routerOutput.tools,
          })

          // Accumulate token usage from pipe agent
          if (pipeOutput.usage) {
            responseData.inputTokens += pipeOutput.usage.promptTokens || 0
            responseData.outputTokens += pipeOutput.usage.completionTokens || 0
          }

          // Execute the pipes according to the instructions and combine results
          const combinedData = await executePipeInstructions(pipeOutput.instructions)

          responseData.explanation = pipeOutput.explanation
          responseData.answer = pipeOutput.explanation
          responseData.reasoning = `Router Decision: ${routerOutput.next_action}\n
                                    Router Reasoning: ${routerOutput.reasoning}\n
                                    Tools Selected: ${routerOutput.tools ? routerOutput.tools.join(', ') : 'none'}\n
                                    Reformulated Question: ${routerOutput.reformulated_question}\n
                                    Pipe Agent Explanation: ${pipeOutput.explanation}`

          responseData.data = combinedData

          dataStream.writeData({
            type: 'pipe-result',
            explanation: pipeOutput.explanation,
            instructions: pipeOutput.instructions,
            data: combinedData,
          })

          if (onResponseComplete) {
            const chatResponseId = await onResponseComplete({
              userPrompt: responseData.question,
              inputTokens: responseData.inputTokens,
              outputTokens: responseData.outputTokens,
              routerResponse: 'pipes',
              routerReason: routerOutput.reasoning,
              pipeInstructions: pipeOutput.instructions,
              sqlQuery: undefined,
              model: MODEL,
            })

            // Stream the chat response ID
            dataStream.writeData({
              type: 'chat-response-id',
              id: chatResponseId,
            })
          }
        }
      } catch (error) {
        dataStream.writeData({
          type: 'router-status',
          status: 'error',
          error: error instanceof Error ? error.message : 'An error occurred',
        })

        throw error
      }
    },
  })
}
