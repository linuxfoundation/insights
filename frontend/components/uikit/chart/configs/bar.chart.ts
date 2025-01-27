import type { BarSeriesOption } from 'echarts/types/dist/shared';
import { buildSeries, convertDateData } from '../helpers/chart-helpers';

import { tooltipFormatter, tooltipLabelFormatter } from '../helpers/formatters';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption from './defaults.chart';
import colors from '@/assets/constants/colors.json';

const defaultBarOption: ECOption = {
  ...defaultOption,
  xAxis: {
    ...defaultOption.xAxis
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        formatter: tooltipLabelFormatter
      }
    },
    formatter: tooltipFormatter
  }
};

const defaultSeriesStyle: BarSeriesOption = {
  // stack: 'stack',
  color: colors.brand[500]
};

const applySeriesStyle = (
  chartSeries: ChartSeries[],
  series: SeriesTypes[] | undefined,
  customStyle?: Partial<SeriesTypes>
): SeriesTypes[] => {
  if (!series) return [];

  return series.map((seriesItem: SeriesTypes, index: number) => {
    const baseStyle = {
      ...defaultSeriesStyle,
      ...seriesItem
    };

    baseStyle.color = chartSeries[index].color || colors.brand[500];

    if (customStyle) {
      // Deep merge custom styles
      return {
        ...baseStyle,
        ...customStyle
      } as BarSeriesOption;
    }

    return baseStyle as SeriesTypes;
  });
};

export const getBarChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  customStyle?: Partial<SeriesTypes>
): ECOption => {
  const xAxis = { ...defaultBarOption.xAxis, data: convertDateData(data) ?? [] };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data), customStyle);

  return {
    ...defaultBarOption,
    xAxis,
    series: styledSeries
  };
};
