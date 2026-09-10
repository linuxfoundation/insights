<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 06 "Signal availability inside and outside the Linux Foundation" component for
  the Health Score Coverage report (IN-1291, epic IN-1276). Not yet wired into
  health-score-coverage-report.vue - see health-score-coverage-signal-availability-lf.types.ts for
  why. Reuses the widget 05 pipe (IN-1290) but is a fully separate component - IN-1290's own
  signal-availability.vue is not touched here.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">06 · Availability</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Signal availability inside and outside the Linux Foundation
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        The widest gaps come from where code is hosted, not from how projects are run. OpenSSF Scorecard and security
        practices are collected for GitHub only, and Linux Foundation repositories sit on Gerrit, GitLab and other hosts
        where those signals do not exist at all.
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
        <p class="text-neutral-500">No signal availability data available.</p>
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
          <p class="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <i
              class="inline-block w-2 h-2 rounded-full"
              :style="{ background: group.color }"
            />
            {{ group.label }}
          </p>
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
            Linux Foundation projects ({{ formatNumber(lfReposTracked) }} repositories) &mdash; colored by category
            above
          </span>
          <span class="flex items-center gap-2">
            <i
              class="inline-block w-3 h-3 rounded-sm"
              :style="{ background: lfxColors.accent[500] }"
            />
            Other tracked projects ({{ formatNumber(otherReposTracked) }} repositories)
          </span>
        </div>
      </div>

      <p class="text-xs text-neutral-400">Signal availability · Linux Foundation and other projects</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { fetchHealthScoreCoverageSignalAvailabilityLfQuery } from '../services/signal-availability-lf.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { HealthScoreCoverageSignalAvailabilityLfSignal } from '~~/types/report/health-score-coverage-signal-availability-lf.types';

// Display names per the design copy, keyed by the pipe's `signal_key`. Duplicated from IN-1290's
// signal-availability.vue rather than imported - that component isn't merged into this release
// branch yet, and this widget owns fully separate files per the merge-order rule (see the types
// file). Same reasoning IN-1290 gives for not importing from a shared config/signals.ts.
const SIGNAL_LABELS: Record<string, string> = {
  commitActivity: 'Commit activity',
  responsiveness: 'Responsiveness',
  orgDiversity: 'Organizational diversity',
  prMerge: 'Pull request merge',
  busFactor: 'Bus factor',
  openVuln: 'Known vulnerabilities',
  issueResolution: 'Issue resolution',
  securityPractices: 'Security practices',
  dependencyHealth: 'Dependency health',
  scorecard: 'OpenSSF Scorecard',
  releaseCadence: 'Release cadence',
};

const displayLabel = (signalKey: string): string => SIGNAL_LABELS[signalKey] ?? signalKey;

// Category grouping and order per the ticket copy: Maintainer health, Security & supply chain,
// Development activity - matches the `category_key` values the pipe already returns per signal.
const CATEGORY_LABELS: Record<string, string> = {
  maintainerHealth: 'Maintainer health',
  securitySupplyChain: 'Security & supply chain',
  developmentActivity: 'Development activity',
};
// One distinct color per category for the "Linux Foundation projects" bars (IN-1304 item 11) -
// "Other tracked projects" stays neutral[400] across all three, unchanged.
const CATEGORY_COLORS: Record<string, string> = {
  maintainerHealth: lfxColors.brand[500],
  securitySupplyChain: lfxColors.violet[500],
  developmentActivity: lfxColors.positive[500],
};
const CATEGORY_ORDER = ['maintainerHealth', 'securitySupplyChain', 'developmentActivity'];

const { data, isLoading, suspense } = fetchHealthScoreCoverageSignalAvailabilityLfQuery();

onServerPrefetch(async () => {
  await suspense();
});

const signals = computed<HealthScoreCoverageSignalAvailabilityLfSignal[]>(() => data.value?.signals ?? []);
const lfReposTracked = computed(() => data.value?.lfReposTracked ?? 0);
const otherReposTracked = computed(() => data.value?.otherReposTracked ?? 0);

const isEmpty = computed(() => !isLoading.value && signals.value.length === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

interface CategoryGroup {
  categoryKey: string;
  label: string;
  color: string;
  signals: HealthScoreCoverageSignalAvailabilityLfSignal[];
  chartConfig: ECOption;
}

// Same visual approach as widget 03 (three grouped horizontal bar charts in one card): each
// category gets its own chart, sized to its own row count, rather than one chart with 11
// categories and inline group headers echarts has no native support for. Inline here rather than
// a separate chart-config module - `pnpm tsc-check` doesn't parse `.vue` files, which broke a
// prior widget's standalone module that imported a type re-exported only from a `.vue` file.
const buildCategoryChartConfig = (
  categorySignals: HealthScoreCoverageSignalAvailabilityLfSignal[],
  lfColor: string,
): ECOption => {
  const categories = categorySignals.map((signal) => displayLabel(signal.signalKey));
  const lfValues = categorySignals.map((signal) => round1(signal.lf.availablePct));
  const otherValues = categorySignals.map((signal) => round1(signal.other.availablePct));

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
        name: 'Linux Foundation projects',
        type: 'bar',
        data: lfValues,
        barMaxWidth: 8,
        itemStyle: {
          color: lfColor,
          borderRadius: [10, 10, 10, 10],
        },
      },
      {
        name: 'Other tracked projects',
        type: 'bar',
        data: otherValues,
        barMaxWidth: 8,
        itemStyle: {
          color: lfxColors.accent[500],
          borderRadius: [10, 10, 10, 10],
        },
      },
    ],
  };
};

const categoryGroups = computed(() =>
  CATEGORY_ORDER.map((categoryKey) => {
    const categorySignals = signals.value
      .filter((signal) => signal.categoryKey === categoryKey)
      .sort((a, b) => b.lf.availablePct - a.lf.availablePct);
    const color = CATEGORY_COLORS[categoryKey] ?? lfxColors.brand[500];

    return {
      categoryKey,
      label: CATEGORY_LABELS[categoryKey] ?? categoryKey,
      color,
      signals: categorySignals,
      chartConfig: buildCategoryChartConfig(categorySignals, color),
    } satisfies CategoryGroup;
  }).filter((group) => group.signals.length > 0),
);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageSignalAvailabilityLf',
};
</script>
