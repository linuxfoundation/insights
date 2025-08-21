// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from "zod";

export type Result = Record<string, string | number>;

// ECharts series type schema
const echartsSeriesSchema = z.object({
  type: z.enum(['bar', 'line', 'pie']),
  seriesLayoutBy: z.enum(['row', 'column']).optional(),
  xAxisIndex: z.number().optional(),
  yAxisIndex: z.number().optional(),
  name: z.string().optional(),
  data: z.array(z.union([z.number(), z.object({
    name: z.string(),
    value: z.number(),
  })])).optional(),
  stack: z.string().optional(),
  areaStyle: z.object({}).optional(), // For area charts (line with areaStyle)
  color: z.string().optional(),
  emphasis: z.object({
    focus: z.enum(['series', 'self']).optional(),
  }).optional(),
});

// ECharts configuration schema
export const configSchema = z.object({
  title: z.object({
    text: z.string(),
    left: z.string().optional(),
    top: z.string().optional(),
    textStyle: z.object({
      fontSize: z.number().optional(),
      fontWeight: z.string().optional(),
      color: z.string().optional(),
      fontFamily: z.string().optional(),
    }).optional(),
  }).optional(),
  dataset: z.object({
    source: z.array(z.array(z.union([z.string(), z.number()]))).optional(),
  }).optional(),
  tooltip: z.object({
    trigger: z.enum(['item', 'axis']),
    axisPointer: z.object({
      type: z.enum(['shadow', 'line', 'cross']).optional(),
    }).optional(),
  }).optional(),
  legend: z.object({
    show: z.boolean().optional(),
    data: z.array(z.string()).optional(),
    orient: z.enum(['horizontal', 'vertical']).optional(),
    left: z.union([z.string(), z.number()]).optional(),
    top: z.union([z.string(), z.number()]).optional(),
    right: z.union([z.string(), z.number()]).optional(),
    bottom: z.union([z.string(), z.number()]).optional(),
    itemWidth: z.number().optional(),
    itemHeight: z.number().optional(),
    itemGap: z.number().optional(),
    textStyle: z.object({
      fontSize: z.number().optional(),
      fontWeight: z.string().optional(),
      color: z.string().optional(),
      fontFamily: z.string().optional(),
    }).optional(),
  }).optional(),
  grid: z.object({
    left: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    top: z.string().optional(),
    containLabel: z.boolean().optional(),
  }).optional(),
  xAxis: z.any().optional(),
  yAxis: z.any().optional(),
  series: z.array(echartsSeriesSchema),
  color: z.array(z.string()).optional(),
  backgroundColor: z.string().optional(),
  animation: z.boolean().optional(),
  animationDuration: z.number().optional(),
});

const dataMappingSchema = z.object({
  originalFieldName: z.string(),
  indexInDataset: z.number(),
  convertedFieldName: z.string(),
  dateConversion: z.string().optional(),
});

export const outputSchema = z.object({
  chartConfig: configSchema,
  dataMapping: dataMappingSchema.array(),
});

export type Config = z.infer<typeof configSchema>;
export type EChartsSeriesConfig = z.infer<typeof echartsSeriesSchema>;
export type DataMapping = z.infer<typeof dataMappingSchema>;