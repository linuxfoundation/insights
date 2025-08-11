// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from "zod";

export type Result = Record<string, string | number>;

export const configSchema = z.object({
  type: z.enum(['bar', 'line', 'area', 'pie']),
  title: z.string(),
  xKey: z.string(),
  yKeys: z.array(z.string()),
  stacked: z.boolean().optional(),
  legend: z.boolean().optional(),
  colors: z.record(z.string(), z.string()).optional(),
  customColors: z.array(z.string()).optional(),
  pivotData: z.object({
    enabled: z.boolean(),
    groupColumn: z.string(),
    categoryColumn: z.string(),
    valueColumn: z.string(),
  }).optional(),
});

export type Config = z.infer<typeof configSchema>;