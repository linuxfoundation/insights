// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {
  BarSeriesOption,
  LineSeriesOption,
  MapSeriesOption,
  PieSeriesOption,
  RadarSeriesOption
} from 'echarts/types/dist/shared';

export interface ChartSeries {
  name: string;
  type: 'line' | 'bar' | 'map' | 'scatter' | 'heatmap' | 'radar';
  yAxisIndex: number;
  dataIndex: number;
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineWidth?: number;
  position?: 'left' | 'right';
}

export interface ChartData {
  key: string;
  yAxisKey?: string;
  values: number[];
  xAxisKey2?: string;
}

export interface GaugeData {
  value: number;
  name: string;
  maxValue?: number;
  color?: string;
  textColor?: string;
  lineColor?: string;
  loading?: boolean;
  noData?: boolean;
  graphOnly?: boolean;
  gaugeType: 'half' | 'full';
}

export interface CategoryDataItem {
  key: string | number;
  value: string | number;
}
// For charts the don't use date series like scatter, we need to pass in the category data
export interface CategoryData {
  xAxis: CategoryDataItem[];
  yAxis: CategoryDataItem[];
}

export type RawChartData = Record<string, string | number | boolean | null>;
export type SeriesTypes =
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | MapSeriesOption
  | RadarSeriesOption;

export interface TreeMapItem {
  id: string;
  name: string;
  count: number;
  softwareValue?: string;
  logoUrl?: string;
  icon?: string;
}

export interface TreeMapData {
  id: string;
  name: string;
  slug: string;
  type: string;
  value: [number, number];
  softwareValue?: string;
  topProjects: TreeMapItem[];
  topCollections: TreeMapItem[];
  link?: string;
  target?: string;
}
