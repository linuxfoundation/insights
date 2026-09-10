<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 01 "Health score bands" component for the Health Score Coverage report
  (IN-1286, epic IN-1276). Not yet wired into health-score-coverage-report.vue - see
  health-score-coverage-bands.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">01 · Distribution</p>
          <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
            Health score bands
          </h3>
        </div>
        <lfx-tabs
          v-model="scope"
          :tabs="SCOPE_TABS"
          tab-style="pill"
          width-type="inline"
        />
      </div>

      <p class="text-body-2 text-neutral-500">{{ descriptionText }}</p>

      <div v-if="isLoading">
        <div class="h-[280px] sm:h-[350px]">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[280px] sm:h-[350px]"
      >
        <p class="text-neutral-500">No health score data available.</p>
      </div>

      <div
        v-else
        class="h-[280px] sm:h-[350px]"
      >
        <client-only>
          <lfx-chart
            :config="chartConfig"
            :animation="true"
          />
        </client-only>
      </div>

      <p class="text-xs text-neutral-400">Project health scores · grouped by band</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref } from 'vue';
import { merge } from 'lodash-es';
import { fetchHealthScoreCoverageBandsQuery } from '../services/band-distribution.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { getHorizontalBarChartConfig, type HorizontalBarData } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  HealthScoreCoverageBandCount,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-bands.types';

const SCOPE_TABS = [
  { value: 'all', label: 'All projects' },
  { value: 'lf', label: 'Linux Foundation' },
  { value: 'other', label: 'Other' },
];

const scope = ref<HealthScoreCoverageScope>('all');

const { data, isLoading, suspense } = fetchHealthScoreCoverageBandsQuery(computed(() => scope.value));

onServerPrefetch(async () => {
  await suspense();
});

const bandLabels = computed(() =>
  (data.value?.bands ?? []).map((band) => band.band.charAt(0).toUpperCase() + band.band.slice(1)),
);

const scoredTotal = computed(() => (data.value?.fullTotal ?? 0) + (data.value?.partialTotal ?? 0));

const descriptionText = computed(
  () =>
    `${formatNumber(scoredTotal.value)} projects have a health score. A project scores in full when ` +
    'all three categories can be measured, and partially when only two can. A partial score is ' +
    "rescaled to 100 so both read against the same bands. Bars show each group's own share, which " +
    'keeps the two comparable despite their different sizes.',
);

const isEmpty = computed(() => !isLoading.value && scoredTotal.value === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

const percentOf = (count: number, total: number): number => (total > 0 ? round1((count / total) * 100) : 0);

interface BandDistributionTooltipParam {
  seriesName: string;
  dataIndex: number;
  value: number;
}

// Grouped two-series horizontal bar chart (full vs. partial scoring), built on top of the shared
// getHorizontalBarChartConfig helper per the report's chart-config conventions - matches how
// report/agentic-ai-momentum/components/research-chart.vue builds its own chart config inline
// rather than in a separate .ts module.
const chartConfig = computed<ECOption>(() => {
  const bands: HealthScoreCoverageBandCount[] = data.value?.bands ?? [];
  const fullTotal = data.value?.fullTotal ?? 0;
  const partialTotal = data.value?.partialTotal ?? 0;

  const baseData: HorizontalBarData[] = bandLabels.value.map((category) => ({ category, value: 0 }));
  const baseConfig = getHorizontalBarChartConfig(baseData, lfxColors.brand[500]);

  const fullLegendLabel = `Scored in full, three categories (${formatNumber(fullTotal)})`;
  const partialLegendLabel = `Partially scored, two categories (${formatNumber(partialTotal)})`;

  return merge({}, baseConfig, {
    xAxis: {
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    // Reserve room below the plot for the x-axis labels plus the legend row(s) - the shared
    // getHorizontalBarChartConfig grid defaults to bottom: 0, which otherwise puts the legend
    // directly on top of the x-axis at every viewport width, worsening as the legend text wraps
    // to two lines on narrower containers.
    grid: {
      bottom: 72,
    },
    legend: {
      bottom: 0,
      data: [fullLegendLabel, partialLegendLabel],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const paramArray = params as BandDistributionTooltipParam[];
        if (!paramArray || paramArray.length === 0) return '';
        return paramArray
          .map((param) => {
            const band = bands[param.dataIndex];
            const count = param.seriesName === fullLegendLabel ? band?.full : band?.partial;
            return `${param.seriesName}: ${formatNumber(count ?? 0)} (${param.value}%)`;
          })
          .join('<br/>');
      },
    },
    series: [
      {
        name: fullLegendLabel,
        type: 'bar',
        barMaxWidth: 8,
        data: bands.map((band) => percentOf(band.full, fullTotal)),
        itemStyle: { color: lfxColors.brand[500], borderRadius: [10, 10, 10, 10] },
      },
      {
        name: partialLegendLabel,
        type: 'bar',
        barMaxWidth: 8,
        data: bands.map((band) => percentOf(band.partial, partialTotal)),
        itemStyle: { color: lfxColors.neutral[400], borderRadius: [10, 10, 10, 10] },
      },
    ],
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageBandDistribution',
};
</script>
