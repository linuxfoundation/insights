// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { routerPrompt } from '../prompts/router';
import { BaseAgent } from './base-agent';

// Output schema for router decisions
export const routerOutputSchema = z.object({
  next_action: z.enum(["stop", "create_query", "pipes"]),
  reasoning: z.string().describe("Maximum 2 sentences explaining the decision"),
  reformulated_question: z.string().describe("Enhanced query with all parameters"),
  tools: z.array(z.string()).describe("Tools needed for next agent")
});

export type RouterOutput = z.infer<typeof routerOutputSchema>;

interface RouterAgentInput {
  model: any; // Bedrock model instance
  messages: any[];
  tools: Record<string, any>; // Only list_datasources
  date: string;
  projectName: string;
  pipe: string;
  parametersString: string;
  segmentId: string | null;
}

export class RouterAgent extends BaseAgent<RouterAgentInput, RouterOutput> {
  readonly name = "Router";
  readonly outputSchema = routerOutputSchema;
  readonly temperature = 0;
  readonly maxSteps = 3; // Allow router to use list_datasources if needed

  protected getModel(input: RouterAgentInput): any {
    return input.model;
  }

  protected getSystemPrompt(input: RouterAgentInput): string {
    return routerPrompt(
      input.date,
      input.projectName,
      input.pipe,
      input.parametersString,
      input.segmentId
    );
  }

  protected getUserPrompt(_input: RouterAgentInput): string {
    // Not used when messages are provided, but required by base class
    return "";
  }

  protected getTools(input: RouterAgentInput): Record<string, any> {
    return input.tools;
  }

  protected createError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`Router agent error: ${error.message}`);
    }
    return new Error(`Router agent error: ${String(error)}`);
  }

}

// Convenience function to maintain backward compatibility
export async function runRouterAgent(params: RouterAgentInput): Promise<RouterOutput> {
  const agent = new RouterAgent();
  return agent.execute(params);
}