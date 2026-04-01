<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div class="h-[280px] sm:h-[400px]">
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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { merge } from 'lodash-es';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import type { GeoDistributionOverTimeDataPoint } from '~~/types/report/cncf.types';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { getCountryColor } from '~/components/modules/report/cncf/config/country-colors';

const props = defineProps<{
  data: GeoDistributionOverTimeDataPoint[];
  granularity: string;
  showPercentage?: boolean;
}>();

const isMobile = ref(false);

function updateIsMobile() {
  isMobile.value = window.innerWidth < 640;
}

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile);
});

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
  props.data.forEach((item) => dates.add(item.startDate));
  return Array.from(dates).sort();
});

const chartData = computed<ChartData[]>(() =>
  uniqueDates.value.map((date) => {
    const rawValues = uniqueCountries.value.map((country) => {
      const dataPoint = props.data.find((item) => item.startDate === date && item.countryCode === country.countryCode);
      return dataPoint?.contributorCount ?? 0;
    });

    if (props.showPercentage) {
      const total = rawValues.reduce((sum, val) => sum + val, 0);
      const percentageValues =
        total > 0 ? rawValues.map((val) => Math.round((val / total) * 1000) / 10) : rawValues.map(() => 0);
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
  const baseConfig = getLineAreaChartConfig(chartData.value, chartSeries.value, props.granularity);

  return merge({}, baseConfig, {
    grid: {
      top: '5%',
      left: '8%',
      right: '15%',
      bottom: '12%',
    },
    media: [
      {
        query: { maxWidth: 640 },
        option: {
          grid: {
            right: '3%',
          },
        },
      },
    ],
    legend: {
      show: false,
    },
    yAxis: props.showPercentage
      ? {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            fontSize: '12px',
            fontWeight: 'normal',
            color: lfxColors.neutral[400],
            formatter: (value: number) => `${value}%`,
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: lfxColors.neutral[200],
            },
          },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      formatter: (paramsRaw: { seriesName: string; value: number; color: string }[]) => {
        const params = Array.isArray(paramsRaw) ? paramsRaw : [paramsRaw];
        const items = params
          .filter((p) => p.value > 0)
          .map(
            (p) => `
            <div style="display: flex; flex-direction: row; align-items: center;
              justify-content: space-between; min-width: 200px; font-weight: 400;
              font-size: 12px; color: ${lfxColors.neutral[900]};">
              <span style="font-weight: 400; font-size: 12px; margin-right: 10px;">
                <span style="background-color: ${p.color}; display: inline-block;
                  border-radius: 100%; height: 8px; width: 8px; margin-right: 4px;"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight: 500; font-size: 12px;">
                ${props.showPercentage ? `${p.value}%` : formatNumber(p.value)}
              </span>
            </div>`,
          )
          .join('');
        return items;
      },
    },
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
          show: !isMobile.value,
          formatter: `${country?.flag || ''} ${country?.country || ''}`,
          fontSize: 11,
          color: lfxColors.neutral[700],
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
