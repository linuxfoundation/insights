// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BarSeriesOption } from 'echarts/types/dist/shared';
import _ from 'lodash';
import { buildSeries, convertDateData } from '../helpers/chart-helpers';
import {
  axisLabelFormatter,
  tooltipFormatter,
  tooltipFormatterWithData,
  tooltipLabelFormatter,
} from '../helpers/formatters';

import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption from './defaults.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatByGranularity } from '~/components/shared/types/granularity';

const defaultBarOption: ECOption = {
  ...defaultOption,
  grid: {
    top: '10%',
    bottom: '14%',
    right: '5%',
  },
  xAxis: {
    ...defaultOption.xAxis,
    axisLabel: {
      ...defaultOption.xAxis.axisLabel,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      label: {
        formatter: tooltipLabelFormatter,
      },
    },
    formatter: tooltipFormatter,
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
      fontFamily: 'Inter',
    },
  },
};

const defaultSeriesStyle: BarSeriesOption = {
  color: lfxColors.brand[500],
  // barWidth: '60%',
  barMaxWidth: 32,
  barGap: '30%',
  barCategoryGap: '60%',
  itemStyle: {
    borderRadius: [2, 2, 2, 2],
    borderWidth: 1,
    // borderColor: '#fff'
  },
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
      ...(seriesItem as BarSeriesOption),
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
  granularity: string
): ECOption => {
  const axisLabelFormat = formatByGranularity[granularity as keyof typeof formatByGranularity] || 'MMM yyyy';

  const xAxis = {
    ...defaultBarOption.xAxis,
    data: convertDateData(data) ?? [],
    axisLabel: {
      ...defaultBarOption.xAxis.axisLabel,
      formatter: axisLabelFormatter(axisLabelFormat),
    },
  };
  const tooltip = _.merge({}, defaultBarOption.tooltip, {
    formatter: tooltipFormatterWithData(data, granularity, series),
  });
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return _.merge({}, defaultBarOption, {
    xAxis,
    series: styledSeries,
    tooltip,
  });
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
  granularity: string,
  overrideConfig?: Partial<ECOption>
  // reuse the same function as the custom config but with the stack option
): ECOption => getBarChartConfigCustom(
    data,
    series,
    {
      stack: 'stack',
      itemStyle: {
        borderRadius: [2, 2, 2, 2],
        borderWidth: 1,
        borderColor: '#fff',
      },
    },
    granularity,
    overrideConfig
  );

export const getBarChartConfigStackAndLine = (
  data: ChartData[],
  series: ChartSeries[],
  granularity: string,
  overrideConfig?: Partial<ECOption>
  // reuse the same function as the custom config but with the stack option
): ECOption => getBarChartConfigCustom(
    data,
    series,
    {
      stack: 'stack',
      itemStyle: {
        borderRadius: [2, 2, 2, 2],
        borderWidth: 1,
        borderColor: '#fff',
      },
    },
    granularity,
    overrideConfig,
    {
      smooth: true,
      showSymbol: false
    }
  );

/**
 * Get bar chart config custom. This can be used to add custom styles to the chart.
 * or override the default styles.
 * @param data - Data
 * @param series - Series
 * @param customStyle - Custom series style (bar chart)
 * @param lineStyle - Custom line style (line chart)
 * @returns Chart config
 */
export const getBarChartConfigCustom = (
  data: ChartData[],
  series: ChartSeries[],
  customStyle: Partial<SeriesTypes>,
  granularity: string,
  overrideConfig?: Partial<ECOption>,
  lineStyle?: Partial<SeriesTypes>
): ECOption => {
  const axisLabelFormat = formatByGranularity[granularity as keyof typeof formatByGranularity] || 'MMM yyyy';

  const xAxis = {
    ...defaultBarOption.xAxis,
    data: convertDateData(data) ?? [],
    axisLabel: {
      ...defaultBarOption.xAxis.axisLabel,
      formatter: axisLabelFormatter(axisLabelFormat),
    },
  };
  const tooltip = _.merge({}, defaultBarOption.tooltip, {
    formatter: tooltipFormatterWithData(data, granularity, series),
  });

  const styledSeries = applySeriesStyle(series, buildSeries(series, data)).map(
    (seriesItem) => ({
        ...seriesItem,
        ...(seriesItem.type === 'bar' ? customStyle : lineStyle),
      } as BarSeriesOption)
  );

  return _.merge(
    {},
    {
      ...defaultBarOption,
      xAxis,
      series: styledSeries,
      tooltip,
    },
    overrideConfig
  );
};
