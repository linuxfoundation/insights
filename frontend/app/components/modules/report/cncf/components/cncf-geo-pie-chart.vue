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
import LfxChart from '~/components/uikit/chart/chart.vue';
import type { GeoDistributionDataPoint } from '~~/types/report/cncf.types';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { getCountryColor } from '~/components/modules/report/cncf/config/country-colors';

const props = defineProps<{
  data: GeoDistributionDataPoint[];
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

const chartConfig = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: { name: string; value: number; percent: number; color: string }) => {
      return `
        <div style="display: flex; flex-direction: row; align-items: center;
          justify-content: space-between; min-width: 200px; font-weight: 400;
          font-size: 12px; color: ${lfxColors.neutral[900]};">
          <span style="font-weight: 400; font-size: 12px; margin-right: 10px;">
            <span style="background-color: ${params.color}; display: inline-block;
              border-radius: 100%; height: 8px; width: 8px; margin-right: 4px;"></span>
            ${params.name}
          </span>
          <span style="font-weight: 500; font-size: 12px;">
            ${formatNumber(params.value)} (${params.percent}%)
          </span>
        </div>`;
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
        borderColor: lfxColors.white,
        borderWidth: 2,
      },
      label: {
        show: !isMobile.value,
        formatter: '{b}: {d}%',
        fontSize: 12,
        color: lfxColors.neutral[600],
      },
      labelLine: {
        show: !isMobile.value,
        length: 15,
        length2: 10,
        lineStyle: {
          color: lfxColors.neutral[300],
        },
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
          color: lfxColors.neutral[900],
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.15)',
        },
      },
      data: props.data.map((item) => ({
        name: `${item.flag} ${item.country}`,
        value: item.contributorCount,
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
