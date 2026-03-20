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
import LfxChart from '~/components/uikit/chart/chart.vue';
import type { GeoTimeseriesDataPoint } from '~~/types/report/cncf.types';
import { lfxColors } from '~/config/styles/colors';

const props = defineProps<{
  data: GeoTimeseriesDataPoint[];
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

// Aggregate data by country across all dates
const aggregatedData = computed(() => {
  const countryTotals = new Map<string, { country: string; countryCode: string; flag: string; total: number }>();

  props.data.forEach((item) => {
    const existing = countryTotals.get(item.countryCode);
    if (existing) {
      existing.total += item.contributorCount;
    } else {
      countryTotals.set(item.countryCode, {
        country: item.country,
        countryCode: item.countryCode,
        flag: item.flag,
        total: item.contributorCount,
      });
    }
  });

  return Array.from(countryTotals.values()).sort((a, b) => b.total - a.total);
});

const chartConfig = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: { name: string; value: number; percent: number }) => {
      return `${params.name}<br/>${params.value.toLocaleString()} contributors (${params.percent}%)`;
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter: '{b}: {d}%',
        fontSize: 12,
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
      data: aggregatedData.value.map((item) => ({
        name: `${item.flag} ${item.country}`,
        value: item.total,
        itemStyle: {
          color: getCountryColor(item.countryCode),
        },
      })),
    },
  ],
}));
</script>

<script lang="ts">
export default {
  name: 'LfxCncfGeoPieChart',
};
</script>
