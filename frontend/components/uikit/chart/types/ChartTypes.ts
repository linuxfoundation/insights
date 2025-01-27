import type {
 BarSeriesOption, LineSeriesOption, MapSeriesOption, PieSeriesOption
} from 'echarts/types/dist/shared';

export interface ChartSeries {
  name: string;
  type: 'line' | 'bar' | 'map';
  yAxisIndex: number;
  dataIndex: number;
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  position?: 'left' | 'right';
}

export interface ChartData {
  key: string;
  values: number[];
}

export type RawChartData = Record<string, string | number | boolean | null>;
export type SeriesTypes = BarSeriesOption | LineSeriesOption | PieSeriesOption | MapSeriesOption;
