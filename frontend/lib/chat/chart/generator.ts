// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { generateObject } from "ai";
import { configSchema } from "./types";
import type { Config, Result } from "./types";
import { analyzeDataForChart, shouldStackBars } from "./analysis";
import { lfxColors } from '~/config/styles/colors';

const bedrock = createAmazonBedrock({
  accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
  region: process.env.NUXT_AWS_BEDROCK_REGION,
});

const defaultColors = [
  lfxColors.brand[500],
  lfxColors.neutral[300],
  lfxColors.violet[500],
  lfxColors.positive[500],
  lfxColors.negative[500],
  lfxColors.brand[300],
  lfxColors.neutral[400],
  lfxColors.violet[400],
  lfxColors.positive[400],
  lfxColors.negative[400]
];

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
      system: "You are a data visualization expert. Create simple, effective chart configurations using the apache echarts configuration schema.",
      prompt: createChartGenerationPrompt(dataProfile, results, userQuery),
      temperature: 0.3,
    });

    // Apply default colors if not already set
    if (!config.color) {
      const colors = generateDefaultColors(config.series.map((s: any) => s.name));
      config.color = colors;
    }

    const finalConfig = config;

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
    if (!newConfig.color) {
      newConfig.color = currentConfig.color;
    }
    
    return newConfig;
  } catch (e) {
    console.error("Failed to modify chart config", e);
    throw new Error("Failed to modify chart configuration");
  }
}

function generateDefaultColors(yKeys: string[]): string[] {
  return yKeys.map((_, index) => defaultColors[index] || lfxColors.brand[500]);
}

function generateFallbackConfig(profile: any): Config {
  // Choose appropriate chart type based on data shape
  let type: "bar" | "line" | "pie" = "bar";
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
        ].filter(Boolean);

  // Auto-detect stacking for multi-series bar charts
  const shouldStack = type === "bar" && yKeys.length > 1 && shouldStackBars(profile);
  const stackName = shouldStack ? "total" : undefined;

  // Generate series configuration
  const series = yKeys.map((yKey: string, index: number) => ({
    type,
    name: yKey,
    data: [], // Will be populated by the chart rendering component
    ...(stackName && { stack: stackName }),
    ...(type === "line" && profile.dataShape === "time-series" && { 
      areaStyle: {} // Enable area style for time-series line charts
    }),
  }));

  // Generate default colors array
  const colors = yKeys.map((_: string, index: number) => `hsl(var(--chart-${index + 1}))`);

  const config: Config = {
    title: {
      text: "Data Visualization",
    },
    tooltip: {
      trigger: type === "pie" ? "item" : "axis",
      ...(type !== "pie" && {
        axisPointer: {
          type: "shadow",
        },
      }),
    },
    legend: {
      show: yKeys.length > 1,
      data: yKeys,
    },
    ...(type !== "pie" && {
      xAxis: {
        type: "category",
        name: xKey,
        data: [], // Will be populated by the chart rendering component
      },
      yAxis: {
        type: "value",
        name: yKeys.length === 1 ? yKeys[0] : "Value",
      },
      grid: {
        left: "8%",
        right: "8%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
    }),
    series,
    color: colors,
  };

  return config;
}

function createChartGenerationPrompt(dataProfile: any, results: Result[], userQuery: string): string {
  const columns = dataProfile.columns.map((c: any) => `${c.name} (${c.type})`).join(", ");
  const sampleData = JSON.stringify(results, null, 2); // JSON.stringify(results.slice(0, 15), null, 2);
  
  return `Based on this data analysis and user query, generate an optimal apache echarts chart configuration.

User Query: ${userQuery}
Data Shape: ${dataProfile.dataShape}
Row Count: ${dataProfile.rowCount}
Columns: ${columns}
Sample Data: ${sampleData}

Create a chart configuration that:
1. Uses the appropriate chart type (bar, line, area, or pie)
2. Strictly follows the apache echarts configuration schema
3. Selects the right columns for x and y axes
4. Includes a clear, descriptive title
5. Enables features like stacking or legends when beneficial
6. Considers data pivoting if needed for better visualization

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