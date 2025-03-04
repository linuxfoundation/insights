import type { BarSeriesOption } from 'echarts/types/dist/shared';
import { merge } from 'lodash';
import { buildSeries, convertDateData } from '../helpers/chart-helpers';

import { tooltipFormatter, tooltipLabelFormatter } from '../helpers/formatters';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption from './defaults.chart';
import { lfxColors } from '~/config/styles/colors';

const defaultBarOption: ECOption = {
  ...defaultOption,
  grid: {
    top: '12%',
    bottom: '12%',
    right: 0
  },
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
  // hiding legend for now since there isn't any on the designs
  legend: {
    show: false,
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
  barWidth: 15,
  barGap: '30%',
  itemStyle: {
    borderRadius: [4, 4, 4, 4],
    borderWidth: 1
    // borderColor: '#fff'
  }
};

/**
 * Apply series style to the chart. This function takes in the default series style and the series
 * and returns the series with the style applied.
 * @param chartSeries - Chart series
 * @param series - Series
 * @returns Series
 */
const applySeriesStyle = (
  chartSeries: ChartSeries[],
  series: SeriesTypes[] | undefined
): SeriesTypes[] => {
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
export const getBarChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  overrideConfig?: Partial<ECOption>
): ECOption => {
  const xAxis = {
    ...defaultBarOption.xAxis,
    data: convertDateData(data) ?? []
  };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return merge(
    {},
    {
      ...defaultBarOption,
      xAxis,
      series: styledSeries
    },
    overrideConfig
  );
};

/**
 * Get bar chart config stacked. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getBarChartConfigStacked = (
  data: ChartData[],
  series: ChartSeries[],
  overrideConfig?: Partial<ECOption>
  // reuse the same function as the custom config but with the stack option
): ECOption => getBarChartConfigCustom(
    data,
    series,
    {
      stack: 'stack',
      itemStyle: {
        borderRadius: [4, 4, 4, 4],
        borderWidth: 1,
        borderColor: '#fff'
      }
    },
    overrideConfig
  );

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
  customStyle: Partial<SeriesTypes>,
  overrideConfig?: Partial<ECOption>
): ECOption => {
  const xAxis = { ...defaultBarOption.xAxis, data: convertDateData(data) ?? [] };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data)).map(
    (seriesItem) => ({
        ...seriesItem,
        ...customStyle
      } as BarSeriesOption)
  );

  return merge(
    {},
    {
      ...defaultBarOption,
      xAxis,
      series: styledSeries
    },
    overrideConfig
  );
};
