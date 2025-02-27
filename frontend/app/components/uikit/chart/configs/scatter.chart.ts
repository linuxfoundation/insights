import type {
  CallbackDataParams,
  MarkLineOption,
  ScatterSeriesOption
} from 'echarts/types/dist/shared';

import { punchCardFormatter } from '../helpers/formatters';
import type {
  CategoryData,
  CategoryDataItem,
  ChartData,
  ChartSeries,
  SeriesTypes
} from '../types/ChartTypes';
import { convertToScatterData } from '../helpers/chart-helpers';
import defaultOption, { categoryData } from './defaults.chart';
import { lfxColors } from '~/config/styles/colors';

/**
 * These are type declarations that were not exported from echarts
 */
declare type ZRLineType = 'solid' | 'dotted' | 'dashed' | number | number[];
declare type YMarkLineOptionData = MarkLineOption & {
  data: {
    y?: number | string;
  }[];
};

const defaultScatterOption: ECOption = {
  ...defaultOption,
  grid: {
    top: '3%',
    left: '5%',
    right: '5%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    ...defaultOption.xAxis,
    boundaryGap: false,
    position: 'top', // move the x axis to the top of the chart
    axisLine: {
      show: false
    },
    axisLabel: {
      align: 'center',
      interval: 0,
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400]
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: [
          // this is a hack to make the x axis line appear dashed in "working hours" sections
          // and solid in "non-working hours" sections
          5,
          5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          5, 5, 5, 5, 5, 5, 5, 5, 1, 28, 160, 30
        ],
        color: lfxColors.neutral[200]
      }
    }
  },
  yAxis: {
    ...defaultOption.yAxis,
    type: 'category',
    axisTick: {
      show: false
    },
    axisLine: {
      show: false,
      onZero: false
    },
    offset: 20, // move the y axis to the left
    axisLabel: {
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400],
      formatter: (value: string) => {
        // make the y axis labels show the hour and the plus icon in smaller font
        const [hour, plus] = value.split('+');
        return plus ? `{a|${hour}}{b|+1}` : `{a|${hour}}`;
      },
      rich: {
        a: {
          fontSize: '12px'
        },
        b: {
          fontSize: '8px'
        }
      }
    },
    splitLine: {
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
  if (maxValue === 0 || value === 0) return 0;
  // Scale the value between 10 and 35
  const minSize = 10;
  const maxSize = 35;
  return Math.max(minSize, (value / maxValue) * (maxSize - minSize) + minSize);
};

// Update the defaultSeriesStyle to use normalized sizes
const defaultSeriesStyle: ScatterSeriesOption = {
  type: 'scatter',
  z: 100,
  animationDelay: (idx: number) => idx * 5,
  // default mark line for the y axis lines
  markLine: {
    symbol: 'none',
    animation: false,
    z: -1,
    label: {
      show: false
    },
    lineStyle: {
      color: lfxColors.neutral[200],
      type: [5, 5],
      width: 1
    },
    emphasis: {
      disabled: true
    },
    tooltip: {
      show: false
    }
  },
  itemStyle: {
    // data points that are in the "working hours" section are gray, and the rest are blue
    color: (params: CallbackDataParams) => {
      const value = params.value as number[];
      const x = value[0] || 0;
      const y = value[1] || 0;
      return x >= 0 && x < 5 && y > 5 ? lfxColors.neutral[200] : lfxColors.brand[200];
    }
  },
  emphasis: {
    itemStyle: {
      color: 'inherit'
    }
  }
};

const isInWorkingHours = (value: number): boolean => value >= 8 && value <= 18;

/**
 * Builds the y axis mark line data hack to make the y axis lines appear in the middle of the circles
 * @param yAxis - The y axis data
 * @returns The y axis mark line data
 */
const buildYAxisMarkLineData = (yAxis: CategoryDataItem[]): MarkLineOption['data'] => [
  ...yAxis
    .map((item, idx) => [
      {
        name: '',
        yAxis: idx, // using the index instead of the value because the scatter plot is using x,y coordinates
        lineStyle: {
          type: isInWorkingHours(+item.value) ? 'solid' : ([5, 5] as ZRLineType)
        }
      },
      {
        // this is the hack to add the "gap" line between the working and non-working hours sections
        yAxis: idx,
        x: '66%',
        lineStyle: {
          type: 'solid' as ZRLineType,
          color: isInWorkingHours(+item.value) ? 'inherit' : lfxColors.white
        }
      },
      // this is the hack to add the solid line on the non-working days section
      { yAxis: idx, x: '81%', lineStyle: { type: 'solid' as ZRLineType } }
    ])
    .flat()
];

/**
 * Builds the x axis mark line data hack for non-working days
 * @returns The x axis mark line data
 */
const buildXAxisMarkLineData = (): YMarkLineOptionData['data'] => [
  {
    // Saturday
    xAxis: 5,
    y: '94%',
    lineStyle: { type: 'solid' as ZRLineType }
  },
  {
    xAxis: 6,
    y: '94%',
    lineStyle: { type: 'solid' as ZRLineType }
  }
];

/**
 * Builds the mark line data
 * @param categoryData - The category data
 * @returns The mark line data
 */
const buildMarkLineData = (categoryData: CategoryData): MarkLineOption => {
  const yAxisMarkLineData = buildYAxisMarkLineData(categoryData.yAxis);
  const xAxisMarkLineData = buildXAxisMarkLineData();
  return {
    ...defaultSeriesStyle.markLine,
    data: [...(yAxisMarkLineData || []), ...(xAxisMarkLineData || [])]
  };
};

const applySeriesStyle = (
  chartSeries: ChartSeries[],
  data: number[][],
  categoryData: CategoryData
): SeriesTypes[] => {
  if (!chartSeries) return [];

  // Find the maximum value in the current dataset
  const maxValue = Math.max(...data.map((item) => item[2] || 0));
  const markLineData = buildMarkLineData(categoryData);

  return chartSeries.map((seriesItem: ChartSeries) => {
    const baseStyle: ScatterSeriesOption = {
      ...defaultSeriesStyle,
      name: seriesItem.name,
      symbolSize: (val: number[]) => {
        // controls the size of the circles
        if (val.length <= 2) return 0;
        const value = val[2] || 0;

        return normalizeSymbolSize(value, maxValue);
      },
      data,
      markLine: markLineData
    };

    return baseStyle as SeriesTypes;
  });
};

/**
 * Get scatter chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getScatterChartConfig = (
  data: ChartData[],
  series: ChartSeries[]
): ECOption => {
  const xAxis = {
    ...defaultScatterOption.xAxis,
    data: categoryData.xAxis.map((item) => item.key)
  };
  const yAxis = {
    ...defaultScatterOption.yAxis,
    data: categoryData.yAxis.map((item) => item.key).reverse()
  };

  const styledSeries = applySeriesStyle(
    series,
    convertToScatterData(data, categoryData),
    categoryData
  );

  return {
    ...defaultScatterOption,
    xAxis,
    yAxis,
    series: styledSeries
  };
};
