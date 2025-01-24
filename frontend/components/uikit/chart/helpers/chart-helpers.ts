import type {
  BarSeriesOption,
  LineSeriesOption,
  MapSeriesOption,
  PieSeriesOption,
  YAXisOption
} from 'echarts/types/dist/shared';
import type { ChartData, ChartSeries } from '../types/ChartTypes';

export type RawChartData = Record<string, string | number | boolean | null>;
type SeriesTypes = BarSeriesOption | LineSeriesOption | PieSeriesOption | MapSeriesOption;

export const convertToChartData = (data: RawChartData[] | null, dateField: string, valuesKey: string[]) => data?.map(
    (item: RawChartData) => ({
        date: item[dateField],
        values: valuesKey.map((key: string) => item[key])
      } as ChartData)
  ) ?? [];

export const convertDateData = (
  chartData: ChartData[] //
) => chartData.map((item: ChartData) => new Date(item.date).getTime()) || [];

export const buildYAxis = (series: ChartSeries[]): YAXisOption[] | undefined => (series.length > 0
    ? series.map((item: ChartSeries) => ({
        type: 'value',
        position: item.position || 'left',
        alignTicks: true
      }))
    : undefined);

export const buildSeries = (series: ChartSeries[], data: ChartData[]): SeriesTypes[] | undefined => (series.length > 0
    ? series.map(
        (series: ChartSeries) => ({
            type: series.type,
            name: series.name,
            yAxisIndex: series.yAxisIndex,
            dataIndex: series.dataIndex,
            data: data.map((item: ChartData) => item.values[series.dataIndex]) || []
          } as SeriesTypes)
      )
    : undefined);
