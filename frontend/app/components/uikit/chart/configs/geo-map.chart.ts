import type { MapSeriesOption } from 'echarts/types/dist/shared';

import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import {lfxColors} from "~/components/config/styles/colors";

interface GeoMapData {
  name: string;
  value: number;
}

const defaultGeoOption: ECOption = {
  visualMap: {
    left: 'right',
    min: 0,
    max: 100000,
    inRange: {
      color: Object.values(lfxColors.brand)
    },
    text: ['High', 'Low'],
    calculable: true
  }
};

const defaultSeriesStyle: MapSeriesOption = {
  roam: true,
  type: 'map',
  map: 'world',
  emphasis: {
    label: {
      show: true
    }
  }
};

/**
 * Build series for the chart. Geo map charts only have one series.
 * So we can't use the buildSeries shared function.
 * @param series - Series
 * @param data - Data
 * @returns Series
 */
const buildSeries = (series: ChartSeries[], data: ChartData[]): SeriesTypes[] | undefined => (series.length > 0
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

export const getGeoMapChartConfig = (data: ChartData[], series: ChartSeries[]): ECOption => ({
  ...defaultGeoOption,
  series: buildSeries(series, data)
});
