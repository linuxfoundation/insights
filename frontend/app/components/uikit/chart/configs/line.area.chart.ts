// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { graphic } from 'echarts';
import type { LineSeriesOption, MarkAreaOption, MarkLineOption } from 'echarts/types/dist/shared';
import _ from 'lodash';
import {
  buildSeries,
  convertDateData,
  convertToGradientColor,
  hexToRgba,
} from '../helpers/chart-helpers';

import {
  axisLabelFormatter,
  tooltipFormatter,
  tooltipFormatterWithData,
  tooltipLabelFormatter,
} from '../helpers/formatters';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption, { defaultGraphOnlyOption } from './defaults.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatByGranularity } from '~/components/shared/types/granularity';

const defaultLineOption: ECOption = {
  ...defaultOption,
  grid: {
    top: '5%',
    left: '12%',
    right: '8%',
    bottom: '15%',
  },
  xAxis: {
    ...defaultOption.xAxis,
    boundaryGap: false,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'none',
      label: {
        formatter: tooltipLabelFormatter,
      },
    },
    formatter: tooltipFormatter,
  },
};

const defaultSeriesStyle: LineSeriesOption = {
  smooth: true,
  showSymbol: false,
  symbolSize: 6,
  lineStyle: {
    width: 1,
    type: 'solid',
  },
  areaStyle: {
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: hexToRgba(lfxColors.brand[500], 0.1) },
      { offset: 0.8, color: hexToRgba(lfxColors.white, 0) },
    ]),
  },
  silent: true,
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
    const baseStyle: LineSeriesOption = {
      ...defaultSeriesStyle,
      ...(seriesItem as LineSeriesOption),
      emphasis: {
        scale: false,
        itemStyle: {
          borderColor: chartSeries[index]?.color || lfxColors.brand[500],
        },
      },
      markArea: chartSeries[index]?.markArea as MarkAreaOption,
      markLine: chartSeries[index]?.markLine as MarkLineOption,
    };
    // adding the color here will override the color in the visualMap
    baseStyle.lineStyle = {
      ...baseStyle.lineStyle,
    //   color: chartSeries[index]?.color || lfxColors.brand[500],
      type: chartSeries[index]?.lineStyle || baseStyle.lineStyle?.type,
      width: chartSeries[index]?.lineWidth || baseStyle.lineStyle?.width || 1,
    };

    // Only solid lines have an area
    // if (chartSeries[index]?.lineStyle && chartSeries[index].lineStyle !== 'solid') {
    //   baseStyle.areaStyle = undefined;
    // } else {
    baseStyle.areaStyle = {
      ...baseStyle.areaStyle,
      color: convertToGradientColor(
        hexToRgba(chartSeries[index]?.color || lfxColors.brand[500], 0.1)
      ),
    };
    // }

    return baseStyle;
  });
};

/**
 * Get line area chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getLineAreaChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  granularity: string,
  yAxisFormatter?: (value: number, index?: number) => string,
  overrideConfig?: Partial<ECOption>
): ECOption => {
  const axisLabelFormat = formatByGranularity[granularity as keyof typeof formatByGranularity] || 'MMM yyyy';

  const xAxis = {
    ...defaultLineOption.xAxis,
    data: convertDateData(data) ?? [],
    axisLabel: {
      ...defaultLineOption.xAxis.axisLabel,
      formatter: axisLabelFormatter(axisLabelFormat),
    },
  };
  const yAxis = {
    ...defaultLineOption.yAxis,
    axisLabel: {
      ...defaultLineOption.yAxis.axisLabel,
      formatter: yAxisFormatter,
    },
  };
  const tooltip = _.merge({}, defaultLineOption.tooltip, {
    formatter: tooltipFormatterWithData(data, granularity, series),
  });

  const styledSeries = applySeriesStyle(series, buildSeries(series, data));
  
  return _.merge(
    {},
    {
      ...defaultLineOption,
      xAxis,
      yAxis,
      series: styledSeries,
      tooltip,
      ...overrideConfig,
    }
  );

};

/**
 * Get line area chart config custom. This can be used to add custom styles to the chart.
 * or override the default styles.
 * @param data - Data
 * @param series - Series
 * @param customStyle - Custom style
 * @returns Chart config
 */
export const getLineAreChartConfigCustom = (
  data: ChartData[],
  series: ChartSeries[],
  customStyle: Partial<SeriesTypes>,
  granularity: string
): ECOption => {
  const axisLabelFormat = formatByGranularity[granularity as keyof typeof formatByGranularity] || 'MMM yyyy';

  const xAxis = {
    ...defaultLineOption.xAxis,
    data: convertDateData(data) ?? [],
    axisLabel: {
      ...defaultLineOption.xAxis.axisLabel,
      formatter: axisLabelFormatter(axisLabelFormat),
    },
  };

  const styledSeries = applySeriesStyle(series, buildSeries(series, data)).map(
    (seriesItem) => ({
        ...seriesItem,
        ...customStyle,
        lineStyle: {
          ...(seriesItem as LineSeriesOption).lineStyle,
          ...(customStyle as LineSeriesOption)?.lineStyle,
        },
        areaStyle: {
          ...(seriesItem as LineSeriesOption).areaStyle,
          ...(customStyle as LineSeriesOption)?.areaStyle,
        },
      } as LineSeriesOption)
  );

  return merge({}, defaultLineOption, {
    xAxis,
    series: styledSeries,
  });
};

/**
 * Get line area chart config graph only.
 * This config is mostly used for charts that appear on the overview page
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getLineAreaChartConfigGraphOnly = (
  data: ChartData[],
  series: ChartSeries[]
): ECOption => {
  const xAxis = {
    ...defaultGraphOnlyOption.xAxis,
    data: convertDateData(data) ?? [],
  };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return {
    ...defaultGraphOnlyOption,
    xAxis,
    series: styledSeries,
  };
};

export const getMarkLine = (xAxisMarker: string): Record<string, unknown> => {
  return {
    symbol: 'none',
    // animation: false,
    data: [
      {
        xAxis: xAxisMarker
      }
    ],
    z: -1,
    label: {
      show: false
    }, 
    lineStyle: {
      color: lfxColors.neutral[300],
      type: 'solid',
      width: 1
    }
  };
};

export const getVisualMap = (columnLength: number, series: ChartSeries[]): Record<string, unknown>[] => {
  return series.map((seriesItem: ChartSeries, idx: number) => ({
    type: 'piecewise',
    show: false,
    seriesIndex: idx,
    dimension: 0,
    pieces: [
      {
        lt: columnLength - 2.1,
        color: seriesItem.color,
        colorAlpha: 1
      },
      {
        gte: columnLength - 2,
        color: lfxColors.neutral[500],
        colorAlpha: .5
      },
    ]
  }));
};