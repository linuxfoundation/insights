// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { pipePrompt } from '../prompts/pipe';
import { BaseAgent } from './base-agent';

// Output schema for pipe agent
export const pipeOutputSchema = z.object({
  tools: z.array(z.string()).describe("Ordered array of tools used to fetch the data"),
  explanation: z.string().describe("Brief explanation of why these tools answer the question"),
  data: z.any().describe("The actual data returned from executing the tools")
});

export type PipeOutput = z.infer<typeof pipeOutputSchema>;

interface PipeAgentInput {
  model: any; // Bedrock model instance
  messages: any[];
  tools: Record<string, any>; // Filtered pipe tools based on router decision
  date: string;
  projectName: string;
  pipe: string;
  parametersString: string;
  segmentId: string | null;
  reformulatedQuestion: string;
  toolNames: string[]; // Array of tool names from router
}

export class PipeAgent extends BaseAgent<PipeAgentInput, PipeOutput> {
  readonly name = "Pipe";
  readonly outputSchema = pipeOutputSchema;
  readonly temperature = 0;
  readonly maxSteps = 10;

  protected getModel(input: PipeAgentInput): any {
    return input.model;
  }

  protected getSystemPrompt(input: PipeAgentInput): string {
    return pipePrompt(
      input.date,
      input.projectName,
      input.pipe,
      input.parametersString,
      input.segmentId,
      input.reformulatedQuestion,
      input.toolNames
    );
  }

  protected getUserPrompt(_input: PipeAgentInput): string {
    // Not used when messages are provided, but required by base class
    return _input.reformulatedQuestion;
  }

  protected getTools(input: PipeAgentInput): Record<string, any> {
    return input.tools;
  }

  protected createError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`Pipe agent error: ${error.message}`);
    }
    return new Error(`Pipe agent error: ${String(error)}`);
  }
}

// Convenience function to maintain backward compatibility
export async function runPipeAgent(params: PipeAgentInput): Promise<PipeOutput> {
  const agent = new PipeAgent();
  return agent.execute(params);
}