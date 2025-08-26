// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { PipeOutput, PipeAgentInput } from '../types';
import { pipeOutputSchema } from '../types';
import { pipePrompt } from '../prompts/pipe';
import { BaseAgent } from './base-agent';

export class PipeAgent extends BaseAgent<PipeAgentInput, PipeOutput> {
  readonly name = "Pipe";
  readonly outputSchema = pipeOutputSchema;
  readonly temperature = 0;
  readonly maxSteps = 10;

  protected getModel(input: PipeAgentInput): any {
    return input.model;
  }

  protected getSystemPrompt(input: PipeAgentInput): string {
  const prompt =  pipePrompt(
      input.date,
      input.projectName,
      input.pipe,
      input.parametersString,
      input.segmentId,
      input.reformulatedQuestion,
      input.toolNames
    )
    return prompt
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