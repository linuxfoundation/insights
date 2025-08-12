// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { streamText, experimental_createMCPClient as createMCPClient, createDataStreamResponse } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { runRouterAgent } from './agents/router';
import { runTextToSqlAgent } from './agents/text-to-sql';
import { runPipeAgent } from './agents/pipe';

const bedrock = createAmazonBedrock({
  accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
  region: process.env.NUXT_AWS_BEDROCK_REGION,
});

export async function streamingAgentRequestHandler({
  messages,
  segmentId,
  projectName,
  pipe,
  parameters,
}: {
  messages: any[];
  segmentId?: string;
  projectName?: string;
  pipe: string;
  parameters?: Record<string, any>;
}) {
  const url = new URL(
    `https://mcp.tinybird.co?token=${process.env.NUXT_INSIGHTS_TINYBIRD_TOKEN}&host=${process.env.NUXT_TINYBIRD_BASE_URL}`
  );

  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(url, {
      sessionId: `session_${Date.now()}`,
    }),
  });

  const tbTools = await mcpClient.tools({});
  // Build a human-readable overview of all tools for the router's prompt (read-only catalog)
  const excludedFromOverview = new Set([
    "explore_data",
    "text_to_sql",
    "list_endpoints",
    "list_service_datasources",
  ]);
  const toolsOverview = Object.entries(tbTools)
    .filter(([name]) => !excludedFromOverview.has(name))
    .map(([name, def]: [string, any]) => {
      try {
        const description = def?.description || def?.meta?.description || "";
        const inputSchema = def?.inputSchema || def?.parameters || def?.schema || undefined;
        const params = inputSchema ? JSON.stringify(inputSchema, null, 2) : undefined;
        return [
          `- ${name}: ${description}`,
          params ? `  params: ${params}` : undefined,
        ]
          .filter(Boolean)
          .join("\n");
      } catch {
        return `- ${name}`;
      }
    })
    .join("\n");
  const parametersString = JSON.stringify(parameters || {});
  const dateString = new Date().toISOString().split("T")[0];
  const model = bedrock("us.anthropic.claude-sonnet-4-20250514-v1:0");

  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        dataStream.writeData({
          type: "router-status",
          status: "analyzing",
        });

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
        });

        if (routerOutput.next_action === "stop") {
          dataStream.writeData({
            type: "router-status",
            status: "complete",
            reasoning: routerOutput.reasoning,
          });

          const result = streamText({
            model,
            messages: [
              ...messages,
              {
                role: "assistant",
                content: routerOutput.reasoning || "I cannot answer this question based on the available data.",
              },
            ],
          });

          result.mergeIntoDataStream(dataStream);
          return;
        }

        dataStream.writeData({
          type: "router-status",
          status: "complete",
          reasoning: routerOutput.reasoning,
          reformulatedQuestion: routerOutput.reformulated_question,
        });

        const followUpTools: Record<string, any> = {};
        for (const toolName of routerOutput.tools) {
          if (tbTools[toolName]) {
            followUpTools[toolName] = tbTools[toolName];
          }
        }

        if (routerOutput.next_action === "create_query") {
          const sqlOutput = await runTextToSqlAgent({
            model,
            messages,
            tools: followUpTools,
            date: dateString as string,
            projectName: projectName as string,
            pipe,
            parametersString,
            segmentId: segmentId as string,
            reformulatedQuestion: routerOutput.reformulated_question,
          });

          dataStream.writeData({
            type: "sql-result",
            sql: sqlOutput.sql,
            explanation: sqlOutput.explanation,
            data: sqlOutput.data
          });
        } else if (routerOutput.next_action === "pipes") {
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
          });

          dataStream.writeData({
            type: "pipe-result",
            tools: pipeOutput.tools,
            explanation: pipeOutput.explanation,
            data: pipeOutput.data
          });
        }
      } catch (error) {
        dataStream.writeData({
          type: "router-status",
          status: "error",
          error: error instanceof Error ? error.message : "An error occurred",
        });

        throw error;
      }
    },
  });
}
