// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { textToSqlPrompt } from '../prompts/text-to-sql';
import { BaseAgent } from './base-agent';

// Output schema for SQL agent
export const sqlOutputSchema = z.object({
  sql: z.string().describe("The SQL query used to fetch the data"),
  explanation: z.string().describe("Brief explanation of why this query answers the question"),
  data: z.any().describe("The actual data returned from executing the query")
});

export type SqlOutput = z.infer<typeof sqlOutputSchema>;

interface TextToSqlAgentInput {
  model: any; // Bedrock model instance
  messages: any[];
  tools: Record<string, any>; // list_datasources and execute_query
  date: string;
  projectName: string;
  pipe: string;
  parametersString: string;
  segmentId: string | null;
  reformulatedQuestion: string;
}

export class TextToSqlAgent extends BaseAgent<TextToSqlAgentInput, SqlOutput> {
  readonly name = "SQL";
  readonly outputSchema = sqlOutputSchema;
  readonly temperature = 0;
  readonly maxSteps = 10; // Allow multiple steps for SQL generation and execution

  protected getModel(input: TextToSqlAgentInput): any {
    return input.model;
  }

  protected getSystemPrompt(input: TextToSqlAgentInput): string {
    return textToSqlPrompt(
      input.date,
      input.projectName,
      input.pipe,
      input.parametersString,
      input.segmentId,
      input.reformulatedQuestion
    );
  }

  protected getUserPrompt(input: TextToSqlAgentInput): string {
    // Not used when messages are provided, but required by base class
    return input.reformulatedQuestion;
  }

  protected getTools(input: TextToSqlAgentInput): Record<string, any> {
    return input.tools;
  }

  protected createError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`SQL agent error: ${error.message}`);
    }
    return new Error(`SQL agent error: ${String(error)}`);
  }

  protected getProviderOptions(_input: TextToSqlAgentInput): any {
    return {
      bedrock: {
        reasoningConfig: { type: "enabled", budgetTokens: 3000 },
      },
    };
  }
}

// Convenience function to maintain backward compatibility
export async function runTextToSqlAgent(params: TextToSqlAgentInput): Promise<SqlOutput> {
  const agent = new TextToSqlAgent();
  return agent.execute(params);
}