// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

// ============================================
// Pipe Instruction Types
// ============================================

// Schema for individual pipe execution
export const pipeExecutionSchema = z.object({
  id: z.string().describe("Unique identifier for referencing this pipe"),
  name: z.string().describe("Actual pipe name to execute"),
  inputs: z.record(z.any()).describe("Input parameters for the pipe")
});

// Schema for output column mapping
export const outputColumnSchema = z.object({
  name: z.string().describe("Column name in final output"),
  pipeId: z.string().describe("Which pipe this column comes from"),
  sourceColumn: z.string().describe("Original column name from that pipe")
});

// Schema for pipe instructions
export const pipeInstructionsSchema = z.object({
  pipes: z.array(pipeExecutionSchema).describe("List of pipes to execute"),
  output: z.array(outputColumnSchema).describe("Define the final output columns")
});

// TypeScript types inferred from schemas
export type PipeExecution = z.infer<typeof pipeExecutionSchema>;
export type OutputColumn = z.infer<typeof outputColumnSchema>;
export type PipeInstructions = z.infer<typeof pipeInstructionsSchema>;

// ============================================
// Agent Output Types
// ============================================

// Router agent output schema
export const routerOutputSchema = z.object({
  next_action: z.enum(["stop", "create_query", "pipes"]),
  reasoning: z.string().describe("Maximum 2 sentences explaining the decision"),
  reformulated_question: z.string().describe("Enhanced query with all parameters"),
  tools: z.array(z.string()).describe("Tools needed for next agent")
});

// Pipe agent output schema
export const pipeOutputSchema = z.object({
  explanation: z.string().describe("Brief explanation of why these pipes answer the question"),
  instructions: pipeInstructionsSchema.describe("Instructions describing how to execute pipes and combine results")
});

// TypeScript types for agent outputs
export type RouterOutput = z.infer<typeof routerOutputSchema>;
export type PipeOutput = z.infer<typeof pipeOutputSchema>;

// ============================================
// Agent Input Types
// ============================================

export interface RouterAgentInput {
  model: any; // Bedrock model instance
  messages: any[];
  tools: Record<string, any>;
  toolsOverview: string;
  date: string;
  projectName: string;
  pipe: string;
  parametersString: string;
  segmentId: string | null;
}

export interface PipeAgentInput {
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