// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { graphic } from 'echarts';
import { DateTime } from 'luxon';
import type {
  ChartData,
  ChartSeries,
  RawChartData,
  SeriesTypes,
  CategoryData,
} from '../types/ChartTypes';

/**
 * Convert raw data to chart data. Since data coming from the backend is not in
 * the format we need, we need to convert it.
 * @param data - Raw data
 * @param keyField - Key field
 * @param valuesKey - Values key
 * @returns Chart data
 */
export const convertToChartData = (
  data: RawChartData[] | null | undefined,
  keyField: string,
  valuesKey: string[],
  yAxisKey?: string,
  xAxisKey2?: string
) => data?.map(
    (item: RawChartData) => ({
        key: item[keyField], // usually the startDate
        yAxisKey: yAxisKey ? item[yAxisKey] : undefined,
        values: valuesKey.map((key: string) => item[key]),
        xAxisKey2: xAxisKey2 ? item[xAxisKey2] : undefined,
      }) as ChartData
  ) ?? [];

export const getMaxValue = (data: ChartData[]): number => data //
    .filter((item) => item.key !== 'Unknown')
    .reduce((max, item) => Math.max(max, item.values[0] ?? 0), 0);

export const convertToCategoryData = (xData: ChartData[], yData: ChartData[]): CategoryData => ({
  xAxis: xData.map((item: ChartData) => ({
    key: parseInt(item.key, 10),
    value: item.values[0] || 0,
  })),
  yAxis: yData.map((item: ChartData) => ({
    key: parseInt(item.key, 10),
    value: item.values[0] || 0,
  })),
});

// function to convert date data to timestamp since the chart needs the date in this format
export const convertDateData = (
  chartData: ChartData[] //
) => chartData.map((item: ChartData) => DateTime.fromISO(item.key).toUTC().endOf('day').toMillis())
  || [];

/**
 * Function to remove the 0 values from the beginning of the chart data
 */
export const removeZeroValues = (data: ChartData[]): ChartData[] => {
  let startIndex = 0;

  // Find the first non-zero value
  for (let i = 0; i < data.length; i += 1) {
    if (data[i]?.values[0] !== 0) {
      startIndex = i;
      break;
    }
  }

  // Return the array starting from the first non-zero value
  return data.slice(startIndex);
};

/**
 * Build series for the chart. The series is where the data is added to the chart.
 * @param series - Series
 * @param data - Data
 * @returns Series
 */
export const buildSeries = (series: ChartSeries[], data: ChartData[]): SeriesTypes[] | undefined => (series.length > 0
    ? series.map(
        (series: ChartSeries) => ({
            type: series.type,
            name: series.name,
            yAxisIndex: series.yAxisIndex,
            dataIndex: series.dataIndex,
            data: data.map((item: ChartData) => item.values[series.dataIndex]) || [],
          }) as SeriesTypes
      )
    : undefined);

export const convertToGradientColor = (
  color: string,
  offsetStart: number = 0.1,
  offsetEnd: number = 1
) => new graphic.LinearGradient(0, 0, 0, 1, [
    {
      offset: offsetStart,
      color, // Start color
    },
    {
      offset: offsetEnd,
      color: 'rgba(255, 255, 255, 0)', // Transparent white for gradient fade
    },
  ]);

// handy function to convert hex color to rgba used for gradient colors in charts
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  // Remove the hash if present
  let cleanHex = hex.replace('#', '');

  // Handle 3-digit hex codes by duplicating each digit
  if (hex.length === 4 || (hex.length === 3 && !hex.startsWith('#'))) {
    const shortHex = hex.replace('#', '');
    cleanHex = `${shortHex[0]}${shortHex[0]}${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}`;
  }

  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Converts ChartData array to array of numbers for scatter plot and
 * heat map data points.
 * @param data - Array of ChartData objects
 * @returns Array of number arrays representing [x, y, value] coordinates
 */
export const convertToScatterData = (data: ChartData[], categoryData: CategoryData): number[][] => {
  const { xAxis } = categoryData;
  const yAxis = [...categoryData.yAxis].reverse();

  // the category data is mapped as x and y axis
  // the y axis is reversed so we need to reverse the y axis key
  return data.map(
    (
      item // data is formatted as [x, y, value]
    ) => [
      xAxis.findIndex((x) => x.value === item.key),
      yAxis.findIndex((y) => y.value === item.yAxisKey),
      item.values[0] || 0,
    ]
  );
};

export const convertToHeatMapData = (data: ChartData[]): number[][] => data.map(
    (
      item // data is formatted as [x, y, value]
    ) => [parseInt(item.key, 10), parseInt(item.yAxisKey || '0', 10), item.values[0] || 0]
  );
