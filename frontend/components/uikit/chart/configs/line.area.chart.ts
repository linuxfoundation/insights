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

const applySeriesStyle = (
  chartSeries: ChartSeries[],
  series: SeriesTypes[] | undefined,
  customStyle?: Partial<SeriesTypes>
): SeriesTypes[] => {
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

    if (customStyle) {
      // Deep merge custom styles
      return {
        ...baseStyle,
        ...customStyle,
        lineStyle: {
          ...baseStyle.lineStyle,
          ...(customStyle as LineSeriesOption)?.lineStyle
        },
        areaStyle: {
          ...baseStyle.areaStyle,
          ...(customStyle as LineSeriesOption)?.areaStyle
        }
      } as LineSeriesOption;
    }

    return baseStyle;
  });
};

export const getLineAreaChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  customStyle?: Partial<SeriesTypes>,
  graphOnly?: boolean
): ECOption => {
  const xAxis = {
    ...(graphOnly ? defaultGraphOnlyOption.xAxis : defaultLineOption.xAxis),
    data: convertDateData(data) ?? []
  };
  const styledSeries = applySeriesStyle(series, buildSeries(series, data), customStyle);

  return {
    ...(graphOnly ? defaultGraphOnlyOption : defaultLineOption),
    xAxis,
    // yAxis: buildYAxis(series),
    series: styledSeries
  };
};
