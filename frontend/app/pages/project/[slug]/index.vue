<template>
  <div class="container !px-5 lg:!px-10">
    <div class="flex justify-between pt-5 md:pt-10">
      <div class="w-3/4 pb-6 md:pb-10">
        <lfx-card>
          <div style="height: 400px;">
            <lfx-chart :config="radarChartConfig" />
          </div>
        </lfx-card>
        <div>
          Trust Score Tabs here
        </div>
      </div>
      <div class="w-1/4 pr-5 min-w-50 xl:pr-10 max-md:hidden block">
        About section here
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import LfxProjectContributorsView from "~/components/modules/project/views/contributors.vue";
import { ref, computed } from 'vue';
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getRadarChartConfig, type RadarIndicator } from '~/components/uikit/chart/configs/radar.chart';
import { lfxColors } from '~/config/styles/colors';
import type { ChartSeries, ChartData } from '~/components/uikit/chart/types/ChartTypes';

const {project} = useProjectStore();

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

const title = `${project?.name || 'Project'} contributors insights | LFX Insights`;
const description = `Explore ${project?.name ? `${project.name} ` : ''}contributors insights,
highlighting their efforts and impact on the project.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
