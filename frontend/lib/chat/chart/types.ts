// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from "zod";

export type Result = Record<string, string | number>;

// ECharts series type schema
const echartsSeriesSchema = z.object({
  type: z.enum(['bar', 'line', 'pie']),
  name: z.string().optional(),
  data: z.array(z.union([z.number(), z.object({
    name: z.string(),
    value: z.number(),
  })])),
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
    }).optional(),
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
    left: z.string().optional(),
    top: z.string().optional(),
  }).optional(),
  grid: z.object({
    left: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    top: z.string().optional(),
    containLabel: z.boolean().optional(),
  }).optional(),
  xAxis: z.object({
    type: z.enum(['category', 'value', 'time', 'log']),
    data: z.array(z.union([z.string(), z.number()])).optional(),
    name: z.string().optional(),
    axisLabel: z.object({
      rotate: z.number().optional(),
      formatter: z.string().optional(),
    }).optional(),
  }).optional(),
  yAxis: z.object({
    type: z.enum(['category', 'value', 'time', 'log']),
    name: z.string().optional(),
    axisLabel: z.object({
      formatter: z.string().optional(),
    }).optional(),
  }).optional(),
  series: z.array(echartsSeriesSchema),
  color: z.array(z.string()).optional(),
  backgroundColor: z.string().optional(),
  animation: z.boolean().optional(),
  animationDuration: z.number().optional(),
});

export type Config = z.infer<typeof configSchema>;
export type EChartsSeriesConfig = z.infer<typeof echartsSeriesSchema>;