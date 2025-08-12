// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ofetch } from 'ofetch';
import type { PipeInstructions } from './types';

// Function to execute a TinyBird pipe
async function executeTinybirdPipe(pipeName: string, parameters: Record<string, any>): Promise<any[]> {
  const tinybirdBaseUrl = process.env.NUXT_TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co';
  const tinybirdToken = process.env.NUXT_INSIGHTS_TINYBIRD_TOKEN || process.env.NUXT_TINYBIRD_TOKEN;

  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined');
  }

  // Build query string from parameters
  const params = new URLSearchParams(
    Object.entries(parameters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();

  const url = params
    ? `${tinybirdBaseUrl}/v0/pipes/${pipeName}.json?${params}`
    : `${tinybirdBaseUrl}/v0/pipes/${pipeName}.json`;

  try {
    const response = await ofetch(url, {
      headers: {
        Authorization: `Bearer ${tinybirdToken}`,
      },
    });

    // TinyBird response format has data array
    return response.data || [];
  } catch (error) {
    console.error(`Error executing TinyBird pipe ${pipeName}:`, error);
    return [];
  }
}

// Function to execute pipe instructions and combine results
export async function executePipeInstructions(instructions: PipeInstructions): Promise<any[]> {
  // Execute the pipes according to the instructions
  const pipeResults: Record<string, any[]> = {};
  
  // Execute each pipe with its inputs using TinyBird API
  for (const pipeInstruction of instructions.pipes) {
    try {
      const result = await executeTinybirdPipe(
        pipeInstruction.name,
        pipeInstruction.inputs
      );
      pipeResults[pipeInstruction.id] = result;
    } catch (error) {
      console.error(`Error executing pipe ${pipeInstruction.name}:`, error);
      pipeResults[pipeInstruction.id] = [];
    }
  }

  // Combine the results according to the output instructions
  const combinedData: any[] = [];
  
  // Find the maximum number of rows across all pipes
  let maxRows = 0;
  for (const pipeId of Object.keys(pipeResults)) {
    maxRows = Math.max(maxRows, pipeResults[pipeId]?.length || 0);
  }

  // Build combined rows
  for (let i = 0; i < maxRows; i++) {
    const row: Record<string, any> = {};
    
    for (const outputColumn of instructions.output) {
      const pipeData = pipeResults[outputColumn.pipeId];
      if (pipeData && pipeData[i]) {
        row[outputColumn.name] = pipeData[i][outputColumn.sourceColumn];
      } else {
        row[outputColumn.name] = null;
      }
    }
    
    combinedData.push(row);
  }

  return combinedData;
}