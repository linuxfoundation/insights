import type { MapSeriesOption } from 'echarts/types/dist/shared';
import { merge } from 'lodash';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';

interface GeoMapData {
  name: string;
  value: number;
}

const defaultGeoOption: ECOption = {
  visualMap: {
    show: false,
    min: 0,
    max: 100000,
    inRange: {
      color: [lfxColors.white, lfxColors.brand[500]] // Object.values(lfxColors.brand)
    },
    text: ['High', 'Low'],
    calculable: true
  },

  tooltip: {
    trigger: 'item',
    showDelay: 0,
    transitionDuration: 0.2,
    borderColor: lfxColors.neutral[100]
  }
};

const defaultSeriesStyle: MapSeriesOption = {
  roam: false,
  type: 'map',
  map: 'world',
  emphasis: {
    label: {
      show: false
    },
    itemStyle: {
      areaColor: lfxColors.brand[600],
      borderColor: lfxColors.neutral[900]
    }
  },
  itemStyle: {
    areaColor: lfxColors.white
  }
};

/**
 * Build series for the chart. Geo map charts only have one series.
 * So we can't use the buildSeries shared function.
 * @param series - Series
 * @param data - Data
 * @returns Series
 */
const buildSeries = (
  series: ChartSeries[],
  data: ChartData[]
): SeriesTypes[] | undefined => (series.length > 0
    ? series.map(
        (series: ChartSeries) => ({
            name: series.name,
            ...defaultSeriesStyle,
            data: serializeDataForGeoMap(data)
          } as SeriesTypes)
      )
    : undefined);

const serializeDataForGeoMap = (data: ChartData[]): GeoMapData[] => data.map((item) => ({
    name: item.key,
    value: item.values[0] ?? 0
  }));

export const getGeoMapChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  maxValue: number = 100000
): ECOption => {
  const option = merge({}, defaultGeoOption, {
    visualMap: {
      max: maxValue
    }
  });

  return {
    ...option,
    series: buildSeries(series, data)
  };
};
