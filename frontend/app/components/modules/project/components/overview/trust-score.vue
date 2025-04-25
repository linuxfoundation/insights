<template>
  <lfx-card class="p-6">
    <div class="flex flex-row justify-between">
      <div class="pr-6 sm:basis-1/2 w-full">
        <div class="flex flex-col justify-between h-full">
          <div>
            <h3 class="text-heading-3 font-bold font-secondary mb-2">Health score</h3>
            <p class="text-xs text-neutral-500">
              The Insights Trust Score combines the four key areas to measure an open source
              project's overall trustworthiness.
              <a
                :href="links.learnMore"
                target="_blank"
                class="text-brand-500"
              >Learn more</a>
            </p>
          </div>
          <div class="flex flex-col w-fit">
            <div>
              <span class="text-[80px] text-neutral-900">76</span>
              <span class="text-sm text-neutral-500">/ 100</span>
            </div>
            <lfx-tag
              :size="'medium'"
              :style="'positive'"
              type="solid"
              class="justify-center"
            >Healthy</lfx-tag>
          </div>
        </div>
      </div>
      <div class="sm:basis-1/2 hidden sm:block">
        <div
          style="height: 280px;"
          class="w-full"
        >
          <lfx-chart :config="radarChartConfig" />
        </div>
      </div>
    </div>

  </lfx-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getRadarChartConfig, type RadarIndicator } from '~/components/uikit/chart/configs/radar.chart';
import { lfxColors } from '~/config/styles/colors';
import type { ChartSeries, ChartData } from '~/components/uikit/chart/types/ChartTypes';
import { links } from '~/config/links';
import LfxTag from '~/components/uikit/tag/tag.vue';

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => [
  {
    key: 'popularity',
    values: [100]
  },
  {
    key: 'contributors',
    values: [70]
  },
  {
    key: 'security',
    values: [70]
  },
  {
    key: 'development',
    values: [40]
  }
  ]
);
const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributors',
    type: 'radar',
    yAxisIndex: 0,
    dataIndex: 0,
    color: lfxColors.brand[500]
  }
]);
const radarIndicators = ref<RadarIndicator[]>([
  {
    key: 'popularity',
    name: 'Popularity',
  },
  {
    key: 'contributors',
    name: 'Contributors',
  },
  {
    key: 'security',
    name: 'Security & Best Practices',
  },
  {
    key: 'development',
    name: 'Development',
  }
]);

const radarChartConfig = computed(() => getRadarChartConfig(chartData.value, chartSeries.value, radarIndicators.value));

</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScore'
};
</script>
