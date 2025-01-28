import type { BarSeriesOption } from 'echarts/types/dist/shared';
import { buildSeries, convertDateData } from '../helpers/chart-helpers';

import { tooltipFormatter, tooltipLabelFormatter } from '../helpers/formatters';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption from './defaults.chart';
import { lfxColors } from '~/components/config/colors';

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
      color: lfxColors.black,
      fontFamily: 'Inter'
    }
  }
};

const defaultSeriesStyle: BarSeriesOption = {
  color: lfxColors.brand[500],
  barWidth: 20,
  barGap: '30%',
  itemStyle: {
    borderRadius: [2, 2, 2, 2],
    borderWidth: 1,
    borderColor: '#fff'
  }
};

/**
 * Apply series style to the chart. This function takes in the default series style and the series
 * and returns the series with the style applied.
 * @param chartSeries - Chart series
 * @param series - Series
 * @returns Series
 */
const applySeriesStyle = (chartSeries: ChartSeries[], series: SeriesTypes[] | undefined): SeriesTypes[] => {
  if (!series) return [];

  return series.map((seriesItem: SeriesTypes, index: number) => {
    const baseStyle: BarSeriesOption = {
      ...defaultSeriesStyle,
      ...(seriesItem as BarSeriesOption)
    };
    // override the color with the color from the chart series if it exists
    baseStyle.color = chartSeries[index]?.color || lfxColors.brand[500];

    return baseStyle as SeriesTypes;
  });
};

/**
 * Get bar chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getBarChartConfig = (data: ChartData[], series: ChartSeries[]): ECOption => {
  const xAxis = { ...defaultBarOption.xAxis, data: convertDateData(data) ?? [] };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return {
    ...defaultBarOption,
    xAxis,
    series: styledSeries
  };
};

/**
 * Get bar chart config stacked. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getBarChartConfigStacked = (
  data: ChartData[],
  series: ChartSeries[]
  // reuse the same function as the custom config but with the stack option
): ECOption => getBarChartConfigCustom(data, series, { stack: 'stack' });

/**
 * Get bar chart config custom. This can be used to add custom styles to the chart.
 * or override the default styles.
 * @param data - Data
 * @param series - Series
 * @param customStyle - Custom style
 * @returns Chart config
 */
export const getBarChartConfigCustom = (
  data: ChartData[],
  series: ChartSeries[],
  customStyle: Partial<SeriesTypes>
): ECOption => {
  const xAxis = { ...defaultBarOption.xAxis, data: convertDateData(data) ?? [] };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data)).map(
    (seriesItem) => ({
        ...seriesItem,
        ...customStyle
      } as BarSeriesOption)
  );

  return {
    ...defaultBarOption,
    xAxis,
    series: styledSeries
  };
};
