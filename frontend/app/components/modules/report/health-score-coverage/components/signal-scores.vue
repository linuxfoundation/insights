<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Widget 03 "Where the strongest repositories pull ahead" for the Health Score Coverage report
  (IN-1288, epic IN-1276). Wired into health-score-coverage-report.vue.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Distribution</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Where the strongest repositories pull ahead
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        Each signal awards a fixed number of points, shown here as a share of that maximum. Every row compares the
        strongest fifth of repositories against the median one. Cells close in color mean the signal barely
        distinguishes anyone. Cells far apart in color mean it is doing real work separating strong repositories from
        the rest. Repositories count only where the signal can be measured. Hover a cell for the exact percentage.
      </p>

      <div v-if="isLoading">
        <div class="h-[560px]">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[560px]"
      >
        <p class="text-neutral-500">No signal score data available.</p>
      </div>

      <div
        v-else
        :style="{ height: `${signals.length * 32 + 80}px` }"
      >
        <client-only>
          <lfx-chart
            :config="chartConfig"
            :animation="true"
          />
        </client-only>
      </div>

      <p class="text-xs text-neutral-400">Signal scores · repositories where the signal can be measured</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
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
  openVuln: 'Known vulnerabilities',
  scorecard: 'OpenSSF Scorecard',
  securityPractices: 'Security practices',
  dependencyHealth: 'Dependency health',
  releaseCadence: 'Release cadence',
  commitActivity: 'Commit activity',
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

const { data, isLoading, suspense } = fetchHealthScoreCoverageSignalScoresQuery();

onServerPrefetch(async () => {
  await suspense();
});

// Signals grouped by category (fixed category order), flattened into one list for the heatmap's
// y-axis - the row label carries both the category and signal name so category grouping stays
// legible without a chart-per-category split.
const signals = computed<HealthScoreCoverageSignalScore[]>(() =>
  CATEGORY_ORDER.flatMap(
    (categoryKey) => data.value?.signals.filter((signal) => signal.categoryKey === categoryKey) ?? [],
  ),
);

const isEmpty = computed(() => !isLoading.value && signals.value.length === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

const rowLabel = (signal: HealthScoreCoverageSignalScore): string =>
  `${CATEGORY_LABELS[signal.categoryKey] ?? signal.categoryKey} · ${displayLabel(signal.signalKey)}`;

// Heatmap by percentile: one row per signal (grouped by category, in fixed category order), two
// columns - "Top 20%" and "Median". Color intensity encodes the percentage value on one shared
// scale, replacing the prior per-category bar coloring (which read as inconsistent, since only the
// Top-20% series carried category color and the median series was always gray). Built inline
// against ECharts' categorical-axis heatmap rather than heat-map.chart.ts's getHeatMapChartConfig,
// which is shaped for numeric day/hour punch-card coordinates and doesn't fit two named columns.
const chartConfig = computed<ECOption>(() => {
  const rows = signals.value;
  const columns = ['Top 20% of repositories', 'Typical repository, the median'];

  const heatmapData: Array<[number, number, number]> = rows.flatMap((signal, rowIndex) => [
    [0, rowIndex, round1(signal.p80Pct)],
    [1, rowIndex, round1(signal.medianPct)],
  ]);

  const maxValue = Math.max(...heatmapData.map((point) => point[2]), 1);

  return {
    grid: {
      left: 320,
      right: '5%',
      top: 24,
      bottom: 56,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: columns,
      splitArea: { show: true },
      axisLabel: {
        fontSize: 12,
        fontWeight: 500,
        color: lfxColors.neutral[900],
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: rows.map((signal) => rowLabel(signal)),
      inverse: true,
      splitArea: { show: true },
      axisLabel: {
        fontSize: 12,
        fontWeight: 500,
        color: lfxColors.neutral[900],
        align: 'left',
        width: 300,
        margin: 300,
        overflow: 'truncate',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: maxValue,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 120,
      inRange: {
        color: [lfxColors.neutral[200], lfxColors.brand[200], lfxColors.brand[500], lfxColors.brand[700]],
      },
      text: ['Distinguishes strongly', 'Barely distinguishes'],
      textStyle: {
        fontSize: 11,
        color: lfxColors.neutral[500],
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const { value } = params as { value: [number, number, number] };
        const [columnIndex, rowIndex, percent] = value;
        const signal = rows[rowIndex];
        const column = columns[columnIndex];
        if (!signal || !column) return '';
        return `${rowLabel(signal)}<br/>${column}: ${percent}%`;
      },
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        itemStyle: {
          borderRadius: 4,
          borderWidth: 4,
          borderColor: lfxColors.white,
        },
        emphasis: {
          itemStyle: {
            borderColor: lfxColors.neutral[900],
            borderWidth: 1,
          },
        },
      },
    ],
  };
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageSignalScores',
};
</script>
