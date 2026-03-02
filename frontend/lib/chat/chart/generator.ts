// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { generateObject } from 'ai';
import { outputSchema } from './types';
import type { Config, DataMapping, Result } from './types';
import { analyzeDataForChart, shouldStackBars, normalizeDataForChart } from './analysis';
import sampleConfig from './base-config';
import { lfxColors } from '~/config/styles/colors';

const bedrock = createAmazonBedrock({
  accessKeyId: process.env.NUXT_AWS_BEDROCK_ACCESS_KEY_ID,
  secretAccessKey: process.env.NUXT_AWS_BEDROCK_SECRET_ACCESS_KEY,
  region: process.env.NUXT_AWS_BEDROCK_REGION,
});

export type ChartConfig = {
  config: Config | null;
  dataMapping: DataMapping[] | null;
  isMetric?: boolean;
};

// Color arrays for different chart types and data point counts
const chartColors = {
  // Single chart type colors (line or bar)
  single: [
    lfxColors.brand[500], // Color A (1 data point)
    lfxColors.violet[500], // Color B (2 data points)
    lfxColors.neutral[400], // Color C (3 data points)
    lfxColors.positive[500], // Color D (4+ data points)
    lfxColors.negative[500],
    lfxColors.brand[300],
    lfxColors.violet[400],
    lfxColors.positive[400],
    lfxColors.negative[400],
  ],
  // Mixed chart colors (bars first, then lines)
  mixed: {
    bars: [lfxColors.brand[500], lfxColors.violet[500], lfxColors.neutral[400]],
    lines: [lfxColors.positive[500], lfxColors.negative[500], lfxColors.brand[300]],
  },
};
const model = bedrock('us.anthropic.claude-opus-4-6-v1');

export async function generateChartConfig(
  results: Result[],
  userQuery: string,
  routerReasoning?: string,
): Promise<ChartConfig> {
  // Re-enable normalization to fix date formatting
  const normalizedResults = normalizeDataForChart(results);
  const dataProfile = analyzeDataForChart(normalizedResults, userQuery, routerReasoning);

  // Skip chart for single values - show as metric
  if (!dataProfile || dataProfile.dataShape === 'single-value') {
    return { config: null, dataMapping: null, isMetric: true };
  }

  try {
    const { object } = await generateObject({
      model,
      output: 'object' as const,
      schema: outputSchema,
      system: `You are a data visualization expert. Create simple, effective chart configurations using the apache echarts configuration schema.
          Make sure the generated chart configuration answers the user's question and fits the data shape.
          ### USER QUESTION 
              ${routerReasoning} 
          ### END USER QUESTION`,
      prompt: createChartGenerationPrompt(dataProfile, normalizedResults, userQuery),
      temperature: 0.1,
    });

    const { chartConfig, dataMapping } = object;

    // Force horizontal bars for leaderboard scenarios
    if (dataProfile?.recommendedVisualization?.type === 'leaderboard') {
      // Swap axes to create horizontal bars
      const tempXAxis = chartConfig.xAxis;
      chartConfig.xAxis = {
        ...chartConfig.yAxis,
        type: 'value',
        inverse: false,
      };

      chartConfig.yAxis = {
        ...tempXAxis,
        type: 'category',
      };

      chartConfig.yAxis.inverse = true;

      if (chartConfig.grid) {
        chartConfig.grid.left = '0.2%';
      }
      chartConfig.series.map((s) => (s.seriesLayoutBy = 'column'));
    }

    // Apply default colors if not already set
    if (!chartConfig.color) {
      const colors = generateDefaultColors(
        chartConfig.series.map((s: any) => s.name),
        chartConfig.series,
      );
      chartConfig.color = colors;

      // Remove individual series colors to let the global color array take precedence
      chartConfig.series = chartConfig.series.map((series: any) => {
        const { color, ...seriesWithoutColor } = series;
        return seriesWithoutColor;
      });
    }

    const finalConfig = chartConfig;

    return { config: finalConfig, dataMapping };
  } catch (e) {
    console.error('Chart generation failed, using fallback', e);
    // Smart fallback
    const fallbackConfig = generateFallbackConfig(dataProfile);
    return { config: fallbackConfig, dataMapping: null };
  }
}

export async function modifyChartConfig(
  currentConfig: Config,
  currentData: Result[],
  userRequest: string,
): Promise<ChartConfig> {
  const normalizedData = normalizeDataForChart(currentData);
  const dataProfile = analyzeDataForChart(normalizedData, userRequest);

  try {
    const { object: newConfig } = await generateObject({
      model,
      output: 'object' as const,
      schema: outputSchema,
      system: 'You are a chart modification expert. Make minimal changes based on user requests.',
      prompt: createChartModificationPrompt(
        currentConfig,
        dataProfile,
        normalizedData,
        userRequest,
      ),
      temperature: 0.1,
    });

    const { chartConfig, dataMapping } = newConfig;
    // Preserve colors if not updated
    if (!chartConfig.color) {
      chartConfig.color = currentConfig.color;
    }

    return { config: chartConfig, dataMapping };
  } catch (e) {
    console.error('Failed to modify chart config', e);
    throw new Error('Failed to modify chart configuration');
  }
}

function generateDefaultColors(
  yKeys: string[],
  series?: Array<{ type: string; name?: string }>,
): string[] {
  if (!series) {
    // Simple case: just pick colors from the single array
    return yKeys.map((_, index) => chartColors.single[index] ?? chartColors.single[0]!);
  }

  // Analyze series types
  const barSeries = series.filter((s) => s.type === 'bar');
  const lineSeries = series.filter((s) => s.type === 'line');
  const isMixed = barSeries.length > 0 && lineSeries.length > 0;

  if (isMixed) {
    // Mixed chart: assign colors based on series type and order
    let barColorIndex = 0;
    let lineColorIndex = 0;

    return series.map((s) => {
      if (s.type === 'bar') {
        const color = chartColors.mixed.bars[barColorIndex];
        barColorIndex++;
        return color ?? chartColors.mixed.bars[0]!;
      } else if (s.type === 'line') {
        const color = chartColors.mixed.lines[lineColorIndex];
        lineColorIndex++;
        return color ?? chartColors.mixed.lines[0]!;
      } else {
        return chartColors.single[0]!; // fallback
      }
    });
  } else {
    // Single chart type: use the single array
    return yKeys.map((_, index) => chartColors.single[index] ?? chartColors.single[0]!);
  }
}

function generateFallbackConfig(profile: any): Config {
  // Choose appropriate chart type based on data shape
  let type: 'bar' | 'line' | 'pie' = 'bar';
  if (profile.dataShape === 'time-series') {
    type = 'line';
  } else if (profile.dataShape === 'categorical' && profile.rowCount <= 6) {
    type = 'pie';
  }

  // Find best columns for axes
  const dateCol = profile.columns.find((c: any) => c.type === 'date');
  const categoryCol = profile.columns.find((c: any) => c.type === 'category');
  const numericCols = profile.columns.filter((c: any) => c.type === 'numeric');

  const xKey = dateCol?.name || categoryCol?.name || profile.columns[0].name;

  // Handle comparison scenarios differently
  let yKeys: string[];
  let useDualAxis = false;
  let primaryKeys: string[] = [];
  let secondaryKeys: string[] = [];
  let isLeaderboard = false;

  if (profile.recommendedVisualization?.type === 'dual-axis') {
    primaryKeys = profile.recommendedVisualization.primaryColumns;
    secondaryKeys = profile.recommendedVisualization.secondaryColumns;
    yKeys = [...primaryKeys, ...secondaryKeys];
    useDualAxis = true;
  } else if (profile.recommendedVisualization?.type === 'grouped-bar') {
    // For grouped bar, focus on primary comparison columns
    yKeys = profile.recommendedVisualization.primaryColumns;
  } else if (profile.recommendedVisualization?.type === 'leaderboard') {
    // For leaderboard, use only the primary metric
    yKeys = profile.recommendedVisualization.primaryColumns;
    isLeaderboard = true;
  } else {
    yKeys =
      numericCols.length > 0
        ? numericCols.map((c: any) => c.name)
        : [
            profile.columns.find((c: any) => c.name !== xKey)?.name || profile.columns[1]?.name,
          ].filter(Boolean);
  }

  // Auto-detect stacking for multi-series bar charts
  const shouldStack =
    type === 'bar' && yKeys.length > 1 && shouldStackBars(profile) && !useDualAxis;
  const stackName = shouldStack ? 'total' : undefined;

  // Generate series configuration
  const series = yKeys.map((yKey: string, index: number) => {
    const isSecondary = useDualAxis && secondaryKeys.includes(yKey);
    return {
      type: isSecondary ? 'line' : type,
      name: yKey,
      yAxisIndex: isSecondary ? 1 : 0,
      ...(stackName && !isSecondary && { stack: stackName }),
      ...(type === 'line' &&
        profile.dataShape === 'time-series' && {
          areaStyle: {}, // Enable area style for time-series line charts
        }),
    };
  });

  // Generate default colors array using the smart color system
  const colors = generateDefaultColors(yKeys, series);

  const config: Config = {
    title: {
      text: 'Data Visualization',
      left: 'center',
      textStyle: {
        fontFamily: 'Roboto Slab',
        fontWeight: '700',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: type === 'pie' ? 'item' : 'axis',
      ...(type !== 'pie' && {
        axisPointer: {
          type: 'shadow',
        },
      }),
    },
    legend: {
      show: yKeys.length > 1,
      data: yKeys,
    },
    ...(type !== 'pie' && {
      // For leaderboard, swap axes to create horizontal bars
      xAxis: isLeaderboard
        ? {
            type: 'value',
            name: yKeys.length === 1 ? yKeys[0] : 'Value',
            axisLabel: {
              fontSize: 12,
              fontWeight: 'normal',
              color: lfxColors.neutral[400],
              fontFamily: 'Inter',
            },
            axisLine: {
              show: false,
            },
            splitLine: { show: false },
            axisTick: { show: false },
          }
        : {
            type: 'category',
            name: xKey,
            axisLabel: {
              fontSize: 12,
              fontWeight: 'normal',
              color: lfxColors.neutral[400],
              fontFamily: 'Inter',
            },
            axisLine: {
              show: false,
            },
            splitLine: { show: false },
            axisTick: { show: false },
          },
      yAxis: isLeaderboard
        ? {
            type: 'category',
            name: xKey,
            axisLabel: {
              fontSize: 12,
              fontWeight: 'normal',
              color: lfxColors.neutral[400],
              fontFamily: 'Inter',
            },
            axisLine: {
              show: false,
            },
            splitLine: { show: false },
            axisTick: { show: false },
          }
        : useDualAxis
          ? [
              {
                type: 'value',
                name: primaryKeys.join(' / '),
                position: 'left',
                axisLabel: {
                  fontSize: 12,
                  fontWeight: 'normal',
                  color: lfxColors.neutral[400],
                  fontFamily: 'Inter',
                },
              },
              {
                type: 'value',
                name: secondaryKeys.join(' / '),
                position: 'right',
                axisLabel: {
                  fontSize: 12,
                  fontWeight: 'normal',
                  color: lfxColors.neutral[400],
                  fontFamily: 'Inter',
                },
              },
            ]
          : {
              type: 'value',
              name: yKeys.length === 1 ? yKeys[0] : 'Value',
              axisLabel: {
                fontSize: 12,
                fontWeight: 'normal',
                color: lfxColors.neutral[400],
                fontFamily: 'Inter',
              },
            },
      grid: {
        left: '8%',
        right: useDualAxis ? '15%' : '8%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
    }),
    series,
    color: colors,
  };

  return config;
}

function createChartGenerationPrompt(
  dataProfile: any,
  results: Result[],
  userQuery: string,
): string {
  const columns = dataProfile.columns.map((c: any) => `${c.name} (${c.type})`).join(', ');
  const sampleData = JSON.stringify(JSON.stringify(results.slice(0, 3), null, 2), null, 2);

  // Add comparison-specific guidance
  let comparisonGuidance = '';
  if (dataProfile.comparisonType && dataProfile.recommendedVisualization) {
    const rec = dataProfile.recommendedVisualization;
    if (rec.type === 'dual-axis') {
      comparisonGuidance = `

SPECIAL CHART TYPE DETECTED: ${dataProfile.comparisonType.toUpperCase()} COMPARISON
- Primary metrics (left axis): ${rec.primaryColumns.join(', ')}
- Secondary metrics (right axis): ${rec.secondaryColumns.join(', ')}
- Use dual Y-axis configuration with different scales
- Primary axis: Use bar charts for the main comparison values
- Secondary axis: Use line charts for change/percentage values
- Configure yAxis as an array with two objects for dual scales`;
    } else if (rec.type === 'grouped-bar') {
      comparisonGuidance = `

SPECIAL CHART TYPE DETECTED: ${dataProfile.comparisonType.toUpperCase()} COMPARISON  
- Show main comparison values: ${rec.primaryColumns.join(', ')}
- Display change values separately or as tooltip info
- Use grouped bar chart to clearly show the comparison
- Consider filtering out percentage columns if they make the chart hard to read`;
    } else if (rec.type === 'leaderboard') {
      comparisonGuidance = `

SPECIAL CHART TYPE DETECTED: LEADERBOARD VISUALIZATION
- Primary ranking metric: ${rec.primaryColumns.join(', ')}
- Secondary metrics (for tooltips only): ${rec.secondaryColumns.join(', ')}
- Use ONLY the primary metric (${rec.primaryColumns.join(', ')}) for the bar chart visualization - DO NOT include secondary metrics as separate series
- Only include the primary ranking metric in the series configuration
- Include secondary metrics in tooltips for additional context, but not as separate chart elements
- Focus on creating a clean, readable horizontal leaderboard chart with category labels on the left
`;
    }
  }

  return `Based on this data analysis and user query, generate an optimal apache echarts chart configuration.

User Query: ${userQuery}
Data Shape: ${dataProfile.dataShape}
Row Count: ${dataProfile.rowCount}
Columns: ${columns}
Sample Data: ${sampleData}
Sample Config: ${JSON.stringify(sampleConfig, null, 2)}${comparisonGuidance}

Create a chart configuration that:
1. Uses the appropriate chart type (bar, line, area, or pie)
2. Strictly follows the apache echarts configuration schema
3. Use the sample config as a reference for the chart configuration, replace the sample data with the actual data
4. Use 'dataset' to store the data, do not use 'data' in the series
5. Selects the right columns for x and y axes
6. Includes a clear, descriptive title
7. Enables features like stacking or legends when beneficial
8. Considers data pivoting if needed for better visualization
9. Do not show X and Y axes titles (axis names), do not show the data values/labels on the X axis, but do show the data value/labels on the Y axis
10. For comparison data with mixed scales, prioritize the most important metrics for visualization
11. IMPORTANT: Convert ALL data rows - do not truncate or skip any data points from the source

Return a valid chart configuration object and how the data was mapped to the chart in the following format:
{
  "chartConfig": <chart configuration object>,
  "dataMapping": [
    {
      "originalFieldName": "originalFieldName",
      "indexInDataset": 0,
      "convertedFieldName": "convertedFieldName",
      "dateConversion": "valid Luxon date format"
    }
  ]
}`;
}

function createChartModificationPrompt(
  currentConfig: Config,
  dataProfile: any,
  currentData: Result[],
  userRequest: string,
): string {
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

Return a complete, valid chart configuration object and how the data was mapped to the chart in the following format:
{
  "chartConfig": <chart configuration object>,
  "dataMapping": [
    {
      "originalFieldName": "originalFieldName",
      "indexInDataset": 0,
      "convertedFieldName": "convertedFieldName",
      "dateConversion": "valid Luxon date format"
    }
  ]
}`;
}
