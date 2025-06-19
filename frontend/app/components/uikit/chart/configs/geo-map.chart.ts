// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { MapSeriesOption, TopLevelFormatterParams } from 'echarts/types/dist/shared';
import _ from 'lodash';
import type { ChartData, ChartSeries, SeriesTypes } from '../types/ChartTypes';
import type { SingleTooltipFormatterParams } from '../types/EChartTypes';
import { lfxColors } from '~/config/styles/colors';
import { geoMapCountries } from '~/components/modules/widget/components/contributors/config/geo-map-countries';

interface GeoMapData {
  name: string;
  value: number;
  percentage: number;
}

const defaultGeoOption: ECOption = {
  layoutCenter: ['50%', '50%'],
  layoutSize: '120%',
  aspectScale: 0.7,
  visualMap: {
    show: false,
    min: 0,
    max: 100000,
    inRange: {
      color: [lfxColors.white, lfxColors.brand[500]], // Object.values(lfxColors.brand)
    },
    text: ['High', 'Low'],
    calculable: true,
  },
  tooltip: {
    trigger: 'item',
    showDelay: 0,
    transitionDuration: 0.2,
    borderColor: lfxColors.neutral[100],
    formatter: (paramRaw: TopLevelFormatterParams) => {
      const params: SingleTooltipFormatterParams = paramRaw as SingleTooltipFormatterParams;

      const data = params.data as GeoMapData;

      return data && Number(data.value) > 0
        ? `${countryNameFormatter(params?.name || '')}
      <div style="
        font-size: 12px; color: ${lfxColors.neutral[900]};
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        min-width: 150px;">
        <span style="font-weight: 400;">
          ${Number.isNaN(data.value) ? 0 : data.value}
          ${params.seriesName}s
        </span>
        <span style="font-weight: 500;">${
          Number.isNaN(data.percentage) ? 0 : data.percentage
        }%</span>
      </div>`
        : null;
    },
  },
};

const defaultSeriesStyle: MapSeriesOption = {
  roam: false,
  type: 'map',
  map: 'world',
  emphasis: {
    label: {
      show: false,
    },
    itemStyle: {
      areaColor: lfxColors.brand[600],
      borderColor: 'inherit', // lfxColors.neutral[900]
    },
  },
  select: {
    disabled: true,
  },
  itemStyle: {
    areaColor: lfxColors.white,
  },
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
            data: serializeDataForGeoMap(data),
          } as SeriesTypes)
      )
    : undefined);

const serializeDataForGeoMap = (data: ChartData[]): GeoMapData[] => data.map((item) => ({
    name: item.key,
    value: item.values[0] ?? 0,
    percentage: item.values[1] ?? 0,
  }));

const countryNameFormatter = (name: string) => {
  const country = geoMapCountries.find((country) => country.name === name);
  const emoji = country?.emoji || '';
  return `<div style="font-size: 12px; margin-bottom: 4px;">
    ${emoji} 
    <span style="color: ${lfxColors.neutral[400]}">${name}</span>
  </div>`;
};

const getLayoutSize = () => {
  const windowWidth = window.innerWidth;
  if (windowWidth >= 1280) {
    return '140%';
  }

  if (windowWidth >= 470) {
    return '120%';
  }

  return '100%';
};

export const getGeoMapChartConfig = (
  data: ChartData[],
  series: ChartSeries[],
  maxValue: number = 100000
): ECOption => {
  const option = _.merge({}, defaultGeoOption, {
    visualMap: {
      max: maxValue,
    },
  });

  option.layoutSize = getLayoutSize();

  return _.merge({}, option, {
    series: buildSeries(series, data),
    // tooltip
  });
};
