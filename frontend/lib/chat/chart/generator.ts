// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { generateObject } from "ai";
import { configSchema } from "./types";
import type { Config, Result } from "./types";
import { analyzeDataForChart, shouldStackBars } from "./analysis";

const bedrock = createAmazonBedrock({
  accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
  region: process.env.NUXT_AWS_BEDROCK_REGION,
});

const model = bedrock("us.anthropic.claude-sonnet-4-20250514-v1:0");

export async function generateChartConfig(
  results: Result[],
  userQuery: string
): Promise<{ config: Config | null; isMetric?: boolean }> {
  const dataProfile = analyzeDataForChart(results, userQuery);

  // Skip chart for single values - show as metric
  if (!dataProfile || dataProfile.dataShape === "single-value") {
    return { config: null, isMetric: true };
  }

  try {
    const { object: config } = await generateObject({
      model,
      output: "object" as const,
      schema: configSchema,
      system: "You are a data visualization expert. Create simple, effective chart configurations.",
      prompt: createChartGenerationPrompt(dataProfile, results, userQuery),
      temperature: 0.3,
    });

    // Apply default colors
    const colors = generateDefaultColors(config.yKeys);
    const finalConfig = { ...config, colors };

    return { config: finalConfig };
  } catch (e) {
    console.error("Chart generation failed, using fallback", e);
    // Smart fallback
    const fallbackConfig = generateFallbackConfig(dataProfile);
    return { config: fallbackConfig };
  }
}

export async function modifyChartConfig(
  currentConfig: Config,
  currentData: Result[],
  userRequest: string
): Promise<Config> {
  const dataProfile = analyzeDataForChart(currentData, userRequest);

  try {
    const { object: newConfig } = await generateObject({
      model,
      output: "object" as const,
      schema: configSchema,
      system: "You are a chart modification expert. Make minimal changes based on user requests.",
      prompt: createChartModificationPrompt(currentConfig, dataProfile, currentData, userRequest),
      temperature: 0.3,
    });

    // Preserve colors if not updated
    if (!newConfig.customColors && !newConfig.colors) {
      newConfig.colors = currentConfig.colors;
    }
    
    return newConfig;
  } catch (e) {
    console.error("Failed to modify chart config", e);
    throw new Error("Failed to modify chart configuration");
  }
}

function generateDefaultColors(yKeys: string[]): Record<string, string> {
  const colors: Record<string, string> = {};
  yKeys.forEach((key, index) => {
    colors[key] = `hsl(var(--chart-${index + 1}))`;
  });
  return colors;
}

function generateFallbackConfig(profile: any): Config {
  // Choose appropriate chart type based on data shape
  let type: Config["type"] = "bar";
  if (profile.dataShape === "time-series") {
    type = "line";
  } else if (profile.dataShape === "categorical" && profile.rowCount <= 6) {
    type = "pie";
  }

  // Find best columns for axes
  const dateCol = profile.columns.find((c: any) => c.type === "date");
  const categoryCol = profile.columns.find((c: any) => c.type === "category");
  const numericCols = profile.columns.filter((c: any) => c.type === "numeric");

  const xKey = dateCol?.name || categoryCol?.name || profile.columns[0].name;
  const yKeys =
    numericCols.length > 0
      ? numericCols.map((c: any) => c.name)
      : [
          profile.columns.find((c: any) => c.name !== xKey)?.name ||
            profile.columns[1]?.name,
        ];

  const config: Config = {
    type,
    title: `Data Visualization`,
    xKey,
    yKeys,
    legend: yKeys.length > 1,
  };

  // Add pivot config if needed
  if (profile.pivotNeeded && profile.pivotConfig) {
    config.pivotData = {
      enabled: true,
      ...profile.pivotConfig,
    };
  }

  // Auto-detect stacking
  if (type === "bar" && yKeys.length > 1) {
    config.stacked = shouldStackBars(profile);
  }

  // Add colors
  config.colors = generateDefaultColors(yKeys);

  return config;
}

function createChartGenerationPrompt(dataProfile: any, results: Result[], userQuery: string): string {
  const columns = dataProfile.columns.map((c: any) => `${c.name} (${c.type})`).join(", ");
  const sampleData = JSON.stringify(results.slice(0, 3), null, 2);
  
  return `Based on this data analysis and user query, generate an optimal chart configuration.

User Query: ${userQuery}
Data Shape: ${dataProfile.dataShape}
Row Count: ${dataProfile.rowCount}
Columns: ${columns}
Sample Data: ${sampleData}

Create a chart configuration that:
1. Uses the appropriate chart type (bar, line, area, or pie)
2. Selects the right columns for x and y axes
3. Includes a clear, descriptive title
4. Enables features like stacking or legends when beneficial
5. Considers data pivoting if needed for better visualization

Return a valid chart configuration object.`;
}

function createChartModificationPrompt(currentConfig: Config, dataProfile: any, currentData: Result[], userRequest: string): string {
  return `Modify the existing chart configuration based on the user's request.

Current Configuration:
${JSON.stringify(currentConfig, null, 2)}

User Request: ${userRequest}

Data Shape: ${dataProfile?.dataShape || 'unknown'}
Row Count: ${currentData.length}

Make minimal changes to satisfy the user's request. Common modifications:
- Change chart type (bar, line, area, pie)
- Toggle stacking on/off
- Change which columns are used
- Update the title
- Toggle legend visibility

Return a complete, valid chart configuration object.`;
}