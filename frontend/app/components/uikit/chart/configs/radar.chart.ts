import type { RadarSeriesOption } from 'echarts/types/dist/shared';
import _ from 'lodash';

import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
// import defaultOption from './defaults.chart';
import { hexToRgba } from '../helpers/chart-helpers';
import { lfxColors } from '~/config/styles/colors';

export interface RadarIndicator {
  key: string;
  name: string;
  max?: number;
}

const defaultRadarOption: ECOption = {
  radar: {
    splitNumber: 3,
    axisName: {
      color: lfxColors.neutral[500]
    },
    axisLine: {
      lineStyle: {
        color: lfxColors.neutral[300],
        type: 'dashed'
      }
    },
    splitLine: {
      lineStyle: {
        color: lfxColors.neutral[300]
      }
    },
    splitArea: {
      show: false
    }
  }
};

const defaultSeriesStyle: RadarSeriesOption = {
  color: lfxColors.brand[500],
  type: 'radar'
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
    const baseStyle: RadarSeriesOption = {
      ...defaultSeriesStyle,
      ...(seriesItem as RadarSeriesOption)
    };
    // override the color with the color from the chart series if it exists
    baseStyle.color = chartSeries[index]?.color || lfxColors.brand[500];

    return baseStyle as SeriesTypes;
  });
};

const buildSeriesData = (
  series: ChartSeries[],
  data: ChartData[]
): SeriesTypes[] | undefined => (series.length > 0
    ? series.map(
        (series: ChartSeries) => ({
            data: [
              {
                value: data.map((item: ChartData) => item.values[series.dataIndex]) || [],
                name: '',
                symbol: 'none',
                lineStyle: {
                  color: lfxColors.brand[500]
                },
                areaStyle: {
                  color: hexToRgba(lfxColors.brand[500], 0.2)
                }
              }
            ]
          } as SeriesTypes)
      )
    : undefined);

/**
 * Get radar chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getRadarChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  indicators: RadarIndicator[]
): ECOption => {
  const styledSeries = applySeriesStyle(series, buildSeriesData(series, data));

  return _.merge({}, defaultRadarOption, {
    series: styledSeries,
    radar: {
      indicator: indicators.map((indicator) => ({
        name: indicator.name,
        max: indicator.max || 100
      }))
    }
  });
};
