// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuditorOutput, AuditorAgentInput } from '../types';
import { auditorOutputSchema } from '../types';
import { auditorPrompt } from '../prompts/auditor';
import { BaseAgent } from './base-agent';

export class AuditorAgent extends BaseAgent<AuditorAgentInput, AuditorOutput> {
  readonly name = 'Auditor';
  readonly outputSchema = auditorOutputSchema;
  readonly temperature = 0.2; // Slightly creative for summaries
  readonly maxSteps = 1;

  protected getModel(input: AuditorAgentInput): any {
    return input.model;
  }

  protected getSystemPrompt(input: AuditorAgentInput): string {
    return auditorPrompt(
      input.originalQuestion,
      input.reformulatedQuestion,
      input.dataSummary,
      input.attemptNumber,
      input.previousFeedback,
    );
  }

  protected getUserPrompt(_input: AuditorAgentInput): string {
    return '';
  }

  protected getTools(_input: AuditorAgentInput): Record<string, any> {
    return {};
  }

  protected createError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`Auditor agent error: ${error.message}`);
    }
    return new Error(`Auditor agent error: ${String(error)}`);
  }
}
