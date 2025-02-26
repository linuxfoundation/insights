import type {
  CallbackDataParams,
  MarkLineOption,
  ScatterSeriesOption
} from 'echarts/types/dist/shared';

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

const categoryData: CategoryData = {
  xAxis: [
    { key: 'Mon', value: 0 },
    { key: 'Tue', value: 1 },
    { key: 'Wed', value: 2 },
    { key: 'Thu', value: 3 },
    { key: 'Fri', value: 4 },
    { key: 'Sat', value: 5 },
    { key: 'Sun', value: 6 }
  ],
  yAxis: [
    { key: '8:00', value: 8 },
    { key: '10:00', value: 10 },
    { key: '12:00', value: 12 },
    { key: '14:00', value: 14 },
    { key: '16:00', value: 16 },
    { key: '18:00', value: 18 },
    { key: '20:00', value: 20 },
    { key: '22:00', value: 22 },
    { key: '0:00+1', value: 0 },
    { key: '2:00+1', value: 2 },
    { key: '4:00+1', value: 4 },
    { key: '6:00+1', value: 6 }
  ]
};

const defaultScatterOption: ECOption = {
  ...defaultOption,
  grid: {
    left: '5%',
    right: '5%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    ...defaultOption.xAxis,
    boundaryGap: false,
    position: 'top',
    // offset: 50,
    axisLine: {
      show: false
    },
    axisLabel: {
      align: 'center',
      interval: 0,
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400] // TODO: change this when we have the correct color
      // the designs are currently using a color hex not defined in the design system
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: [5, 5],
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
    offset: 20,
    axisLabel: {
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400],
      formatter: (value: string) => {
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
  if (maxValue === 0) return 0;
  // Scale the value between 0 and 20, maintaining proportions
  return (value / maxValue) * 30;
};

// Update the defaultSeriesStyle to use normalized sizes
const defaultSeriesStyle: ScatterSeriesOption = {
  type: 'scatter',
  z: 100,
  animationDelay: (idx: number) => idx * 5,
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
    color: (params: CallbackDataParams) => {
      const value = params.value as number[];
      const x = value[0] || 0;
      const y = value[1] || 0;
      return x >= 0 && x < 5 && y > 5 ? lfxColors.neutral[200] : lfxColors.brand[500];
    }
  },
  emphasis: {
    itemStyle: {
      color: 'inherit'
    }
  }
};

const buildMarkLineData = (categoryData: CategoryData): MarkLineOption => ({
  ...defaultSeriesStyle.markLine,
  data: [
    ...categoryData.yAxis
      .map((item, idx) => [
        {
          name: '',
          yAxis: idx,
          lineStyle: { type: +item.value >= 8 && +item.value <= 18 ? 'solid' : [5, 5] }
        },
        { yAxis: idx, x: '66%', lineStyle: { type: 'solid' } }
      ])
      .flat()
  ]
});

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
      color: seriesItem.color || lfxColors.brand[500],
      symbolSize: (val: number[]) => {
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
