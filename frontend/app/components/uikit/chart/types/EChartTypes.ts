// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TooltipComponentOption } from 'echarts/components';

// Workaround for the missing formatter callback params
type Unified<T> = Exclude<T, T[]>;
type TooltipFormatterCallback = Exclude<NonNullable<TooltipComponentOption['formatter']>, string>;
// single and multiple params
export type TooltipFormatterParams = Parameters<TooltipFormatterCallback>[0];
// single params
export type SingleTooltipFormatterParams = Unified<TooltipFormatterParams>;
// multiple params
export type MultipleTooltipFormatterParams = SingleTooltipFormatterParams[];

export interface TreeLabelFormatterParams {
  seriesName: string;
  name: string;
  value: number[];
  borderColor: string;
  color: string;
  componentIndex: number;
  componentSubType: string;
  componentType: string;
  data: {
    value: number[];
    name: string;
    id: string;
  };
  dataIndex: number;
  dimensionNames: [];
  encode: { value: number[] };
  seriesId: string;
  seriesIndex: number;
  seriesType: string;
  status: string;
}
