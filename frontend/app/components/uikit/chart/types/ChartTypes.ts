import type {
 BarSeriesOption, LineSeriesOption, MapSeriesOption, PieSeriesOption
} from 'echarts/types/dist/shared';

export interface ChartSeries {
  name: string;
  type: 'line' | 'bar' | 'map' | 'scatter';
  yAxisIndex: number;
  dataIndex: number;
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  position?: 'left' | 'right';
}

export interface ChartData {
  key: string;
  yAxisKey?: string;
  values: number[];
}

export interface CategoryDataItem {
  key: string;
  value: string;
}
// For charts the don't use date series like scatter, we need to pass in the category data
export interface CategoryData {
  xAxis: CategoryDataItem[];
  yAxis: CategoryDataItem[];
}

export type RawChartData = Record<string, string | number | boolean | null>;
export type SeriesTypes = BarSeriesOption | LineSeriesOption | PieSeriesOption | MapSeriesOption;
