import { graphic } from 'echarts';
import type {
 ChartData, ChartSeries, RawChartData, SeriesTypes
} from '../types/ChartTypes';

export const convertToChartData = (data: RawChartData[] | null, dateField: string, valuesKey: string[]) => data?.map(
    (item: RawChartData) => ({
        date: item[dateField],
        values: valuesKey.map((key: string) => item[key])
      } as ChartData)
  ) ?? [];

export const convertDateData = (
  chartData: ChartData[] //
) => chartData.map((item: ChartData) => new Date(item.date).getTime()) || [];

// TODO: check if we'll need multiple yAxis
// export const buildYAxis = (series: ChartSeries[]): YAXisOption[] | undefined =>
//   series.length > 0
//     ? series.map((item: ChartSeries) => ({
//         type: 'value',
//         position: item.position || 'left',
//         alignTicks: true
//       }))
//     : undefined;

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

export const convertToGradientColor = (color: string) => new graphic.LinearGradient(0, 0, 0, 1, [
    {
      offset: 0,
      color // Start color
    },
    {
      offset: 1,
      color: 'rgba(255, 255, 255, 0)' // Transparent white for gradient fade
    }
  ]);

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  // Remove the hash if present
  let cleanHex = hex.replace('#', '');

  // Handle 3-digit hex codes by duplicating each digit
  if (hex.length === 4 || (hex.length === 3 && !hex.startsWith('#'))) {
    const shortHex = hex.replace('#', '');
    cleanHex = `${shortHex[0]}${shortHex[0]}${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}`;
  }

  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
