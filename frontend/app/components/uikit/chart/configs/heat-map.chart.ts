import type { HeatmapSeriesOption } from 'echarts/types/dist/shared';

import { punchCardFormatter } from '../helpers/formatters';
import type {
  CategoryData,
  ChartData,
  ChartSeries,
  SeriesTypes
} from '../types/ChartTypes';
import { convertToScatterData } from '../helpers/chart-helpers';
import defaultOption from './defaults.chart';
import { lfxColors } from '~/config/styles/colors';

type pieceRange = {
  min: number;
  max: number;
};

const defaultHeatMapOption: ECOption = {
  ...defaultOption,
  grid: {
    top: '3%',
    left: '-15',
    right: '0',
    bottom: '45'
  },
  xAxis: {
    ...defaultOption.xAxis,
    // boundaryGap: true,
    offset: 5,
    axisLabel: {
      show: false
    }
  },
  yAxis: {
    ...defaultOption.yAxis,
    type: 'category',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: { show: false },
    axisLabel: {
      show: false
    }
  },
  visualMap: {
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    inRange: {
      color: [
        lfxColors.neutral[200],
        lfxColors.brand[200],
        lfxColors.brand[500],
        lfxColors.brand[700]
      ]
    },
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 0
  },
  graphic: {
    // TODO: Find a better way to do this
    // this is hack to render the text in the visualMap
    elements: [
      {
        type: 'text',
        left: 'center',
        bottom: '5%',
        style: {
          text: 'Less',
          fill: '#000',
          font: '12px Inter',
          padding: [0, 175, 4, 0],
          borderWidth: 1,
          borderColor: 'transparent'
        }
      }
    ]
  },
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'none'
    },
    formatter: punchCardFormatter
  }
};

// Update the defaultSeriesStyle to use normalized sizes
const defaultSeriesStyle: HeatmapSeriesOption = {
  type: 'heatmap',
  label: {
    show: false
  },
  itemStyle: {
    borderRadius: 4,
    borderWidth: 4,
    borderColor: lfxColors.white
  },
  emphasis: {
    focus: 'series',
    itemStyle: {
      color: 'inherit',
      borderWidth: 2
    }
  }
};

const applySeriesStyle = (
  chartSeries: ChartSeries[],
  data: number[][]
): SeriesTypes[] => {
  if (!chartSeries) return [];

  return chartSeries.map((seriesItem: ChartSeries) => {
    const baseStyle: HeatmapSeriesOption = {
      ...defaultSeriesStyle,
      name: seriesItem.name,
      color: seriesItem.color || lfxColors.brand[500],
      data
    };

    return baseStyle as SeriesTypes;
  });
};

/**
 * Splits a numeric range into 4 equal segments
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @returns Array of ranges with min/max values
 */
const splitRange = (min: number, max: number): pieceRange[] => {
  const step = (max - min) / 4;
  return [
    { min, max: min + step },
    { min: min + step, max: min + step * 2 },
    { min: min + step * 2, max: min + step * 3 },
    { min: min + step * 3, max }
  ];
};

/**
 * Get heat map chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getHeatMapChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  categoryData: CategoryData
): ECOption => {
  const xAxis = {
    ...defaultHeatMapOption.xAxis,
    data: categoryData.xAxis.map((item) => item.key)
  };
  const yAxis = {
    ...defaultHeatMapOption.yAxis,
    data: categoryData.yAxis.map((item) => item.key)
  };
  const convertedData = convertToScatterData(data);
  const styledSeries = applySeriesStyle(series, convertedData);
  // Find the maximum value in the current dataset
  const maxValue = Math.max(...convertedData.map((item) => item[2] || 0));
  const splitRanges = splitRange(0, maxValue);

  return {
    ...defaultHeatMapOption,
    visualMap: {
      ...defaultHeatMapOption.visualMap,
      max: maxValue,
      pieces: splitRanges.map((range: pieceRange, index: number) => ({
        min: range.min,
        max: range.max,
        label: index === splitRanges.length - 1 ? `More` : ' '
      }))
    },
    xAxis,
    yAxis,
    series: styledSeries
  };
};
