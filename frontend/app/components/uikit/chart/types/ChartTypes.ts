import type {
  BarSeriesOption,
  LineSeriesOption,
  MapSeriesOption,
  PieSeriesOption
} from 'echarts/types/dist/shared';

export interface ChartSeries {
  name: string;
  type: 'line' | 'bar' | 'map' | 'scatter';
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
}

export interface GaugeData {
  value: number;
  name: string;
  maxValue?: number;
  color?: string;
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
  | MapSeriesOption;
