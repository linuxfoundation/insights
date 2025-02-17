import { graphic } from 'echarts';
import type { LineSeriesOption } from 'echarts/types/dist/shared';
import { merge } from 'lodash';
import {
  buildSeries,
  convertDateData,
  convertToGradientColor,
  hexToRgba
} from '../helpers/chart-helpers';

import { tooltipFormatter, tooltipLabelFormatter } from '../helpers/formatters';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption, { defaultGraphOnlyOption } from './defaults.chart';
import { lfxColors } from '~/config/styles/colors';

const defaultLineOption: ECOption = {
  ...defaultOption,
  grid: {
    top: '5%',
    left: '8%',
    right: '1%'
  },
  xAxis: {
    ...defaultOption.xAxis,
    boundaryGap: false
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

const defaultSeriesStyle: LineSeriesOption = {
  smooth: true,
  showSymbol: false,
  lineStyle: {
    width: 1,
    type: 'solid'
  },
  areaStyle: {
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: hexToRgba(lfxColors.brand[500], 0.1) },
      { offset: 0.8, color: hexToRgba(lfxColors.white, 0) }
    ])
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
    const baseStyle: LineSeriesOption = {
      ...defaultSeriesStyle,
      ...(seriesItem as LineSeriesOption)
    };
    baseStyle.lineStyle = {
      ...baseStyle.lineStyle,
      color: chartSeries[index]?.color || lfxColors.brand[500],
      type: chartSeries[index]?.lineStyle || baseStyle.lineStyle?.type
    };

    // Only solid lines have an area
    if (chartSeries[index]?.lineStyle && chartSeries[index].lineStyle !== 'solid') {
      baseStyle.areaStyle = undefined;
    } else {
      baseStyle.areaStyle = {
        ...baseStyle.areaStyle,
        color: convertToGradientColor(
          hexToRgba(chartSeries[index]?.color || lfxColors.brand[500], 0.1)
        )
      };
    }

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
  overrideConfig?: Partial<ECOption>
): ECOption => {
  const xAxis = {
    ...defaultLineOption.xAxis,
    data: convertDateData(data) ?? []
  };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return merge(
    {
      ...defaultLineOption,
      xAxis,
      // yAxis: buildYAxis(series),
      series: styledSeries
    },
    overrideConfig
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
  customStyle: Partial<SeriesTypes>
): ECOption => {
  const styledSeries = applySeriesStyle(series, buildSeries(series, data)).map(
    (seriesItem) => ({
        ...seriesItem,
        ...customStyle,
        lineStyle: {
          ...(seriesItem as LineSeriesOption).lineStyle,
          ...(customStyle as LineSeriesOption)?.lineStyle
        },
        areaStyle: {
          ...(seriesItem as LineSeriesOption).areaStyle,
          ...(customStyle as LineSeriesOption)?.areaStyle
        }
      } as LineSeriesOption)
  );

  return {
    ...defaultLineOption,
    series: styledSeries
  };
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
    data: convertDateData(data) ?? []
  };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return {
    ...defaultGraphOnlyOption,
    xAxis,
    series: styledSeries
  };
};
