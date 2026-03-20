<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div class="h-[400px]">
      <client-only>
        <lfx-chart
          :config="chartConfig"
          :animation="true"
        />
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { merge } from 'lodash-es';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import type { GeoTimeseriesDataPoint } from '~~/types/report/cncf.types';
import { lfxColors } from '~/config/styles/colors';

const props = defineProps<{
  data: GeoTimeseriesDataPoint[];
  granularity: string;
  showPercentage?: boolean;
}>();

// National colors for each country
const COUNTRY_COLOR_MAP: Record<string, string> = {
  US: '#3C3B6E', // United States - Navy blue
  IN: '#FF9933', // India - Saffron orange
  CN: '#DE2910', // China - Red
  DE: '#FFCC00', // Germany - Gold
  GB: '#012169', // United Kingdom - Royal blue
  CA: '#FF0000', // Canada - Red
  FR: '#0055A4', // France - Blue
  JP: '#BC002D', // Japan - Red
  BR: '#009739', // Brazil - Green
  AU: '#00008B', // Australia - Dark blue
  XX: '#94A3B8', // Other - Gray
};

const getCountryColor = (countryCode: string): string => {
  return COUNTRY_COLOR_MAP[countryCode] || lfxColors.neutral[400];
};

const uniqueCountries = computed(() => {
  const countryMap = new Map<string, { country: string; countryCode: string; flag: string }>();
  props.data.forEach((item) => {
    if (!countryMap.has(item.countryCode)) {
      countryMap.set(item.countryCode, {
        country: item.country,
        countryCode: item.countryCode,
        flag: item.flag,
      });
    }
  });
  return Array.from(countryMap.values());
});

const uniqueDates = computed(() => {
  const dates = new Set<string>();
  props.data.forEach((item) => dates.add(item.date));
  return Array.from(dates).sort();
});

const chartData = computed<ChartData[]>(() =>
  uniqueDates.value.map((date) => {
    const rawValues = uniqueCountries.value.map((country) => {
      const dataPoint = props.data.find(
        (item) => item.date === date && item.countryCode === country.countryCode,
      );
      return dataPoint?.contributorCount ?? 0;
    });

    if (props.showPercentage) {
      const total = rawValues.reduce((sum, val) => sum + val, 0);
      const percentageValues = total > 0
        ? rawValues.map((val) => Math.round((val / total) * 1000) / 10)
        : rawValues.map(() => 0);
      return {
        key: date,
        values: percentageValues,
      };
    }

    return {
      key: date,
      values: rawValues,
    };
  }),
);

const chartSeries = computed<ChartSeries[]>(() =>
  uniqueCountries.value.map((country, index) => ({
    name: `${country.flag} ${country.country}`,
    type: 'line',
    yAxisIndex: 0,
    dataIndex: index,
    color: getCountryColor(country.countryCode),
  })),
);

const chartConfig = computed(() => {
  const baseConfig = getLineAreaChartConfig(
    chartData.value,
    chartSeries.value,
    props.granularity,
  );

  return merge({}, baseConfig, {
    grid: {
      top: '5%',
      left: '8%',
      right: '15%',
      bottom: '12%',
    },
    legend: {
      show: false,
    },
    yAxis: props.showPercentage
      ? {
          type: 'value',
          max: 100,
          axisLabel: {
            formatter: '{value}%',
          },
        }
      : undefined,
    tooltip: props.showPercentage
      ? {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
          valueFormatter: (value: number) => `${value}%`,
        }
      : undefined,
    series: (baseConfig.series as unknown[])?.map((s: unknown, index: number) => {
      const country = uniqueCountries.value[index];
      const countryCode = country?.countryCode || 'XX';
      const color = getCountryColor(countryCode);
      return {
        ...(s as Record<string, unknown>),
        stack: 'geo',
        areaStyle: {
          opacity: 1,
          color,
        },
        lineStyle: {
          width: 0,
        },
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color,
        },
        endLabel: {
          show: true,
          formatter: `${country?.flag || ''} ${country?.country || ''}`,
          fontSize: 11,
          color: '#334155',
          distance: 8,
          overflow: 'truncate',
          ellipsis: '...',
        },
        labelLayout: {
          hideOverlap: true,
        },
      };
    }),
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxCncfGeoStackedChart',
};
</script>
