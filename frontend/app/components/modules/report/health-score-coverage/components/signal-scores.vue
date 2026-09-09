<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 03 "Where the strongest repositories pull ahead" component for the Health
  Score Coverage report (IN-1288, epic IN-1276). Not yet wired into
  health-score-coverage-report.vue - see health-score-coverage-signal-scores.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">03 · Distribution</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Where the strongest repositories pull ahead
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        Each signal awards a fixed number of points, shown here as a share of that maximum. Every row compares the
        strongest fifth of repositories against the median one. Bars close together mean the signal barely distinguishes
        anyone. Bars far apart mean it is doing real work separating strong repositories from the rest. Repositories
        count only where the signal can be measured.
      </p>

      <div v-if="isLoading">
        <div class="h-[420px]">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[420px]"
      >
        <p class="text-neutral-500">No signal score data available.</p>
      </div>

      <div
        v-else
        class="flex flex-col gap-4"
      >
        <div
          v-for="group in categoryGroups"
          :key="group.categoryKey"
          class="flex flex-col gap-1"
        >
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{{ group.label }}</p>
          <div :style="{ height: `${group.signals.length * 64 + 24}px` }">
            <client-only>
              <lfx-chart
                :config="group.chartConfig"
                :animation="true"
              />
            </client-only>
          </div>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-1 text-body-2 text-neutral-500">
          <span class="flex items-center gap-2">
            <i
              class="inline-block w-3 h-3 rounded-sm"
              :style="{ background: lfxColors.brand[500] }"
            />
            Top 20% of repositories
          </span>
          <span class="flex items-center gap-2">
            <i
              class="inline-block w-3 h-3 rounded-sm"
              :style="{ background: lfxColors.neutral[400] }"
            />
            Typical repository, the median
          </span>
        </div>
      </div>

      <p class="text-xs text-neutral-400">Signal scores · repositories where the signal can be measured</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { fetchHealthScoreCoverageSignalScoresQuery } from '../services/signal-scores.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { lfxColors } from '~/config/styles/colors';
import type { HealthScoreCoverageSignalScore } from '~~/types/report/health-score-coverage-signal-scores.types';

// Display names per the design copy, keyed by the pipe's `signal_key`. Duplicated here rather than
// imported from config/signals.ts because that shared file is created by IN-1285 and isn't ready
// for this widget to depend on yet - see the types file for the merge-order explanation.
const SIGNAL_LABELS: Record<string, string> = {
  busFactor: 'Bus factor',
  orgDiversity: 'Organizational diversity',
  responsiveness: 'Responsiveness',
  scorecard: 'OpenSSF Scorecard',
  securityPractices: 'Security practices',
  dependencyHealth: 'Dependency health',
  releaseCadence: 'Release cadence',
  issueResolution: 'Issue resolution',
  prMerge: 'Pull request merge',
};

const displayLabel = (signalKey: string): string => SIGNAL_LABELS[signalKey] ?? signalKey;

// Category grouping and order per the ticket copy: Maintainer health, Security & supply chain,
// Development activity - matches the `category_key` values the pipe already returns per signal.
const CATEGORY_LABELS: Record<string, string> = {
  maintainerHealth: 'Maintainer health',
  securitySupplyChain: 'Security & supply chain',
  developmentActivity: 'Development activity',
};
const CATEGORY_ORDER = ['maintainerHealth', 'securitySupplyChain', 'developmentActivity'];

const { data, isLoading } = fetchHealthScoreCoverageSignalScoresQuery();

const signals = computed<HealthScoreCoverageSignalScore[]>(() => data.value?.signals ?? []);

const isEmpty = computed(() => !isLoading.value && signals.value.length === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

interface CategoryGroup {
  categoryKey: string;
  label: string;
  signals: HealthScoreCoverageSignalScore[];
  chartConfig: ECOption;
}

// Three grouped horizontal bar charts in one card, one per category, each with two series (top
// 20% vs median). Inline here rather than a separate chart-config module - `pnpm tsc-check`
// doesn't parse `.vue` files, which broke a prior widget's standalone module that imported a type
// re-exported only from a `.vue` file.
const buildCategoryChartConfig = (categorySignals: HealthScoreCoverageSignalScore[]): ECOption => {
  const categories = categorySignals.map((signal) => displayLabel(signal.signalKey));
  const p80Values = categorySignals.map((signal) => round1(signal.p80Pct));
  const medianValues = categorySignals.map((signal) => round1(signal.medianPct));

  return {
    grid: {
      left: 170,
      right: '5%',
      top: 4,
      bottom: 4,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        fontSize: 10,
        fontWeight: 'normal',
        color: lfxColors.neutral[400],
        formatter: '{value}%',
      },
      axisLine: { show: false },
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: lfxColors.neutral[200],
        },
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
      axisLabel: {
        fontSize: 13,
        fontWeight: 500,
        color: lfxColors.neutral[900],
        align: 'left',
        width: 150,
        margin: 150,
        overflow: 'truncate',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    legend: { show: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const paramArray = params as Array<{ seriesName: string; value: number }>;
        if (!paramArray || paramArray.length === 0) return '';
        return paramArray.map((param) => `${param.seriesName}: ${param.value}%`).join('<br/>');
      },
    },
    series: [
      {
        name: 'Top 20% of repositories',
        type: 'bar',
        data: p80Values,
        barMaxWidth: 8,
        itemStyle: {
          color: lfxColors.brand[500],
          borderRadius: [10, 10, 10, 10],
        },
      },
      {
        name: 'Typical repository, the median',
        type: 'bar',
        data: medianValues,
        barMaxWidth: 8,
        itemStyle: {
          color: lfxColors.neutral[400],
          borderRadius: [10, 10, 10, 10],
        },
      },
    ],
  };
};

const categoryGroups = computed(() =>
  CATEGORY_ORDER.map((categoryKey) => {
    const categorySignals = signals.value.filter((signal) => signal.categoryKey === categoryKey);

    return {
      categoryKey,
      label: CATEGORY_LABELS[categoryKey] ?? categoryKey,
      signals: categorySignals,
      chartConfig: buildCategoryChartConfig(categorySignals),
    } satisfies CategoryGroup;
  }).filter((group) => group.signals.length > 0),
);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageSignalScores',
};
</script>
