<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 02 "How projects are maintained" component for the Health Score Coverage report
  (IN-1287, epic IN-1276). Not yet wired into health-score-coverage-report.vue - see
  health-score-coverage-lifecycle.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Distribution</p>
          <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
            How projects are maintained
          </h3>
        </div>
        <lfx-tabs
          v-model="scope"
          :tabs="SCOPE_TABS"
          tab-style="pill"
          width-type="inline"
        />
      </div>

      <p class="text-body-2 text-neutral-500">
        Lifecycle tracks maintenance, not health. A project can be actively maintained and still score poorly. A project
        takes the best state among the packages it publishes, so a single maintained package keeps it active.
        Unavailable means no published package is linked to the project yet.
      </p>

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
        <p class="text-neutral-500">No lifecycle data available.</p>
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

      <p class="text-xs text-neutral-400">{{ captionText }}</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref } from 'vue';
import { merge } from 'lodash-es';
import { fetchHealthScoreCoverageLifecycleQuery } from '../services/lifecycle-distribution.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { getHorizontalBarChartConfig, type HorizontalBarData } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  HealthScoreCoverageLifecycleCount,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-lifecycle.types';

const SCOPE_TABS = [
  { value: 'all', label: 'All projects' },
  { value: 'lf', label: 'Linux Foundation' },
  { value: 'other', label: 'Other' },
];

// Caption wording per scope, verbatim from the artifact: the "all" scope reads "all tracked
// projects", but "lf"/"other" don't just swap in a word - they're their own phrasing
// ("Linux Foundation projects" / "projects outside the Linux Foundation").
const SCOPE_CAPTION_WORDING: Record<HealthScoreCoverageScope, string> = {
  all: 'all tracked projects',
  lf: 'Linux Foundation projects',
  other: 'projects outside the Linux Foundation',
};

const LABEL_DISPLAY_OVERRIDES: Record<string, string> = {
  unavailable: 'Unavailable',
};

const displayLabel = (label: string): string =>
  LABEL_DISPLAY_OVERRIDES[label] ?? label.charAt(0).toUpperCase() + label.slice(1);

const scope = ref<HealthScoreCoverageScope>('all');

const { data, isLoading, suspense } = fetchHealthScoreCoverageLifecycleQuery(computed(() => scope.value));

onServerPrefetch(async () => {
  await suspense();
});

const rows = computed<HealthScoreCoverageLifecycleCount[]>(() => data.value?.rows ?? []);
const total = computed(() => data.value?.total ?? 0);

const isEmpty = computed(() => !isLoading.value && total.value === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

const percentOf = (count: number, totalCount: number): number =>
  totalCount > 0 ? round1((count / totalCount) * 100) : 0;

const captionText = computed(
  () => `Project lifecycle · ${SCOPE_CAPTION_WORDING[scope.value]} (${formatNumber(total.value)})`,
);

interface LifecycleTooltipParam {
  dataIndex: number;
  value: number;
}

// Single-series horizontal bar chart, built on top of the shared getHorizontalBarChartConfig
// helper per the report's chart-config conventions - matches how
// report/agentic-ai-momentum/components/research-chart.vue builds its own chart config inline
// rather than in a separate .ts module.
const chartConfig = computed<ECOption>(() => {
  const chartData: HorizontalBarData[] = rows.value.map((row) => ({
    category: displayLabel(row.label),
    value: percentOf(row.projects, total.value),
  }));

  const baseConfig = getHorizontalBarChartConfig(chartData, lfxColors.brand[500]);

  return merge({}, baseConfig, {
    xAxis: {
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    tooltip: {
      formatter: (params: unknown) => {
        const paramArray = params as LifecycleTooltipParam[];
        if (!paramArray || paramArray.length === 0) return '';
        const param = paramArray[0];
        const row = rows.value[param.dataIndex];
        if (!row) return '';
        return `${displayLabel(row.label)}: ${param.value}% (${formatNumber(row.projects)})`;
      },
    },
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageLifecycleDistribution',
};
</script>
