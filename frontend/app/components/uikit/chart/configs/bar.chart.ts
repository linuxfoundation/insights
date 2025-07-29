// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { graphic } from 'echarts';
import type { BarSeriesOption } from 'echarts/types/dist/shared';
import _ from 'lodash';
import { convertDateData } from '../helpers/chart-helpers';
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

/**
 * Create a striped pattern for bar fills with small 45-degree stripes
 * @param color - Base color for the stripes
 * @param opacity - Opacity of the stripes (default: 0.8)
 * @param stripeWidth - Width of each stripe as a percentage (default: 0.08 = 8%)
 * @returns Linear gradient object that creates a striped pattern
 */
const createStripedPattern = (color: string, opacity: number = 0.8, stripeWidth: number = 0.01) => {
  const colorStops = [];
  const lightColor = '#fff'; // `rgba(${hexToRgb(color)}, ${opacity})`;
  const darkColor = `rgba(${hexToRgb(color)}, ${opacity})`;
  
  // Create alternating stripes across the entire gradient
  for (let i = 0; i <= 1; i += stripeWidth * 2) {
    // Light stripe
    if (i <= 1) {
      colorStops.push({ offset: Math.min(i, 1), color: lightColor });
      colorStops.push({ offset: Math.min(i + stripeWidth, 1), color: lightColor });
    }
    
    // Dark stripe
    const darkStart = i + stripeWidth;
    const darkEnd = i + stripeWidth * 2;
    if (darkStart <= 1) {
      colorStops.push({ offset: Math.min(darkStart, 1), color: darkColor });
      colorStops.push({ offset: Math.min(darkEnd, 1), color: darkColor });
    }
  }
  
  // Ensure we end at 1.0
  const lastStop = colorStops[colorStops.length - 1];
  if (lastStop && lastStop.offset < 1) {
    colorStops.push({ offset: 1, color: lastStop.color });
  }
  
  // Create 45-degree diagonal gradient (0,0 to 1,1 creates perfect 45-degree angle)
  return new graphic.LinearGradient(0, 0, 1, 1, colorStops);
};

/**
 * Create predefined stripe patterns
 */
const createStripedPatterns = {
  fine: (color: string, opacity: number = 0.5) => createStripedPattern(color, opacity, 0.04), // Very fine stripes (4%)
  small: (color: string, opacity: number = 0.8) => createStripedPattern(color, opacity, 0.08), // Small stripes (8%) - default
  medium: (color: string, opacity: number = 0.8) => createStripedPattern(color, opacity, 0.12), // Medium stripes (12%)
  large: (color: string, opacity: number = 0.8) => createStripedPattern(color, opacity, 0.2), // Large stripes (20%)
};

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string
 * @returns RGB values as string
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1] || '0', 16);
  const g = parseInt(result[2] || '0', 16);
  const b = parseInt(result[3] || '0', 16);
  
  return `${r}, ${g}, ${b}`;
};

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

/**
 * Build series for the chart. The series is where the data is added to the chart.
 * @param series - Series
 * @param data - Data
 * @returns Series
 */
export const buildSeriesWithStyle = (
  series: ChartSeries[], 
  data: ChartData[]
): SeriesTypes[] | undefined => (series.length > 0
  ? series.map(
      (series: ChartSeries) => ({
          type: series.type,
          name: series.name,
          yAxisIndex: series.yAxisIndex,
          dataIndex: series.dataIndex,
          data: data.map((item: ChartData) => {
            return { value: item.values[series.dataIndex], ...getDataItemStyle(item.isIncomplete, series.color) };
          }) || [],
        }) as SeriesTypes
    )
  : undefined);

const getDefaultSeriesStyle = (useStripedPattern: boolean = false): BarSeriesOption => ({
  color: useStripedPattern ? createStripedPatterns.fine(lfxColors.brand[500]) : lfxColors.brand[500],
  // barWidth: '60%',
  barMaxWidth: 32,
  barGap: '30%',
  barCategoryGap: '60%',
  itemStyle: {
    borderRadius: [2, 2, 2, 2],
    borderWidth: 1,
    // borderColor: '#fff'
  },
});

const getDataItemStyle = (
  useStripedPattern: boolean = false,
  color: string = lfxColors.brand[500]): BarSeriesOption => ({
  itemStyle: {
    color: useStripedPattern ? createStripedPatterns.fine(color) : color,
    borderRadius: [2, 2, 2, 2],
    borderWidth: 1
  },
});

/**
 * Apply series style to the chart. This function takes in the default series style and the series
 * and returns the series with the style applied.
 * @param chartSeries - Chart series
 * @param series - Series
 * @param useStripedPattern - Whether to use striped patterns (default: false)
 * @returns Series
 */
const applySeriesStyle = (
  chartSeries: ChartSeries[],
  series: SeriesTypes[] | undefined,
  useStripedPattern: boolean = false,
): SeriesTypes[] => {
  if (!series) return [];

  return series.map((seriesItem: SeriesTypes) => {
    const baseStyle: BarSeriesOption = {
      ...getDefaultSeriesStyle(useStripedPattern),
      ...(seriesItem as BarSeriesOption),
    };
    
    return baseStyle as SeriesTypes;
  });
};

/**
 * Get bar chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @param granularity - Time granularity for axis formatting
 * @param useStripedPattern - Whether to use striped patterns for bar fills (default: false)
 * @returns Chart config
 */
export const getBarChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  granularity: string,
  useStripedPattern: boolean = false
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
  
  const styledSeries = applySeriesStyle(
    series,
    buildSeriesWithStyle(series, data),
    useStripedPattern
  );

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
 * @param granularity - Time granularity for axis formatting
 * @param overrideConfig - Additional config to merge
 * @param useStripedPattern - Whether to use striped patterns for bar fills (default: false)
 * @returns Chart config
 */
export const getBarChartConfigStacked = (
  data: ChartData[],
  series: ChartSeries[],
  granularity: string,
  overrideConfig?: Partial<ECOption>,
  useStripedPattern: boolean = false
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
    undefined,
    useStripedPattern
  );

export const getBarChartConfigStackAndLine = (
  data: ChartData[],
  series: ChartSeries[],
  granularity: string,
  overrideConfig?: Partial<ECOption>,
  useStripedPattern: boolean = false
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
    },
    useStripedPattern
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
  lineStyle?: Partial<SeriesTypes>,
  useStripedPattern: boolean = false
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

  const styledSeries = applySeriesStyle(
    series, buildSeriesWithStyle(series, data), useStripedPattern
  ).map(
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
