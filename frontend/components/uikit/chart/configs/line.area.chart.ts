import { graphic } from 'echarts';
import type { LineSeriesOption } from 'echarts/types/dist/shared';
import {
 buildSeries, convertDateData, convertToGradientColor, hexToRgba
} from '../helpers/chart-helpers';

import { tooltipFormatter, tooltipLabelFormatter } from '../helpers/formatters';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import defaultOption, { defaultGraphOnlyOption } from './defaults.chart';
import colors from '@/assets/constants/colors.json';

const defaultLineOption: ECOption = {
  ...defaultOption,
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
    width: 2,
    type: 'solid'
  },
  areaStyle: {
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: hexToRgba(colors.brand[500], 0.1) },
      { offset: 0.8, color: hexToRgba(colors.white, 0) }
    ])
  }
};

const applySeriesStyle = (chartSeries: ChartSeries[], series: SeriesTypes[] | undefined): SeriesTypes[] => {
  if (!series) return [];

  return series.map((seriesItem: SeriesTypes, index: number) => {
    const baseStyle: LineSeriesOption = {
      ...defaultSeriesStyle,
      ...(seriesItem as LineSeriesOption)
    };
    baseStyle.lineStyle = {
      ...baseStyle.lineStyle,
      color: chartSeries[index].color || colors.brand[500],
      type: chartSeries[index].lineStyle || baseStyle.lineStyle?.type
    };

    if (chartSeries[index].lineStyle && chartSeries[index].lineStyle !== 'solid') {
      baseStyle.areaStyle = undefined;
    } else {
      baseStyle.areaStyle = {
        ...baseStyle.areaStyle,
        color: convertToGradientColor(chartSeries[index].color || hexToRgba(colors.brand[500]))
      };
    }

    return baseStyle;
  });
};

export const getLineAreaChartConfig = (data: ChartData[], series: ChartSeries[]): ECOption => {
  const xAxis = {
    ...defaultLineOption.xAxis,
    data: convertDateData(data) ?? []
  };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data));

  return {
    ...defaultLineOption,
    xAxis,
    // yAxis: buildYAxis(series),
    series: styledSeries
  };
};

export const getLineAreChartConfigCustom = (
  data: ChartData[],
  series: ChartSeries[],
  customStyle: Partial<SeriesTypes>
): ECOption => {
  const styledSeries = applySeriesStyle(series, buildSeries(series, data)).map((seriesItem) => ({
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
    } as LineSeriesOption));

  return {
    ...defaultLineOption,
    series: styledSeries
  };
};

export const getLineAreaChartConfigGraphOnly = (data: ChartData[], series: ChartSeries[]): ECOption => {
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
