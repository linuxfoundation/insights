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
  },
  legend: {
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    itemWidth: 15,
    itemHeight: 15,
    itemGap: 40,
    textStyle: {
      fontSize: 12,
      fontWeight: 'normal',
      color: colors.black,
      fontFamily: 'Inter'
    }
  }
};

const defaultSeriesStyle: BarSeriesOption = {
  color: colors.brand[500],
  barWidth: 20,
  barGap: '30%',
  itemStyle: {
    borderRadius: [2, 2, 2, 2],
    borderWidth: 1,
    borderColor: '#fff'
  }
};

const applySeriesStyle = (
  chartSeries: ChartSeries[],
  series: SeriesTypes[] | undefined,
  customStyle?: Partial<SeriesTypes>
): SeriesTypes[] => {
  if (!series) return [];

  return series.map((seriesItem: SeriesTypes, index: number) => {
    const baseStyle: BarSeriesOption = {
      ...defaultSeriesStyle,
      ...(seriesItem as BarSeriesOption)
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
