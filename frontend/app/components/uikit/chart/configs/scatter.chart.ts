import type { ScatterSeriesOption } from 'echarts/types/dist/shared';

import { punchCardFormatter } from '../helpers/formatters';
import type {
 CategoryData, ChartData, ChartSeries, SeriesTypes
} from '../types/ChartTypes';
import defaultOption from './defaults.chart';
import {lfxColors} from "~/components/config/styles/colors";

const defaultScatterOption: ECOption = {
  ...defaultOption,
  xAxis: {
    ...defaultOption.xAxis,
    boundaryGap: false,
    position: 'top',
    axisLabel: {
      align: 'center',
      interval: 0,
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400] // TODO: change this when we have the correct color
      // the designs are currently using a color hex not defined in the design system
    }
  },
  yAxis: {
    ...defaultOption.yAxis,
    type: 'category',
    axisTick: {
      show: false
    }
  },
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'none'
    },
    formatter: punchCardFormatter
  }
};

/**
 * Normalizes the symbol size for scatter plot points with a maximum size of 20
 * @param value - The value to normalize
 * @param maxValue - The maximum value in the dataset
 * @returns Normalized size between 0 and 20
 */
const normalizeSymbolSize = (value: number, maxValue: number): number => {
  if (maxValue === 0) return 0;
  // Scale the value between 0 and 20, maintaining proportions
  return (value / maxValue) * 30;
};

// Update the defaultSeriesStyle to use normalized sizes
const defaultSeriesStyle: ScatterSeriesOption = {
  type: 'scatter',
  animationDelay: (idx: number) => idx * 5
};

const applySeriesStyle = (chartSeries: ChartSeries[], data: number[][]): SeriesTypes[] => {
  if (!chartSeries) return [];

  return chartSeries.map((seriesItem: ChartSeries, index: number) => {
    const baseStyle: ScatterSeriesOption = {
      ...defaultSeriesStyle,
      name: seriesItem.name,
      color: seriesItem.color,
      symbolSize: (val: number[]) => {
        if (val.length <= 2) return 0;
        const value = val[2] || 0;
        // Find the maximum value in the current dataset
        const maxValue = Math.max(...data.map((item) => item[2] || 0));

        return normalizeSymbolSize(value, maxValue);
      },
      data
    };
    baseStyle.color = chartSeries[index]?.color || lfxColors.brand[500];
    return baseStyle as SeriesTypes;
  });
};

/**
 * Converts ChartData array to array of numbers for scatter plot data points
 * @param data - Array of ChartData objects
 * @returns Array of number arrays representing [x, y, value] coordinates
 */
const convertToScatterData = (data: ChartData[]): number[][] => data.map(
    (
      item // data is formatted as [x, y, value]
    ) => [parseInt(item.key, 10), parseInt(item.yAxisKey || '0', 10), item.values[0] || 0]
  );

/**
 * Get scatter chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getScatterChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  categoryData: CategoryData
): ECOption => {
  const xAxis = { ...defaultScatterOption.xAxis, data: categoryData.xAxis.map((item) => item.key) };
  const yAxis = { ...defaultScatterOption.yAxis, data: categoryData.yAxis.map((item) => item.key) };
  const styledSeries = applySeriesStyle(series, convertToScatterData(data));

  return {
    ...defaultScatterOption,
    xAxis,
    yAxis,
    series: styledSeries
  };
};
