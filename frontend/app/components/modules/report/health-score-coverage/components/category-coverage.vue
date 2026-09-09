<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 04 "Repositories we can score, by category" component for the Health Score
  Coverage report (IN-1289, epic IN-1276). Not yet wired into health-score-coverage-report.vue -
  see health-score-coverage-category-coverage.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">04 · Availability</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Repositories we can score, by category
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        Maintainer health and development activity are measurable for roughly two thirds of repositories. Security
        reaches the fewest, because several of its signals only exist for repositories hosted on GitHub.
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

      <p class="text-xs text-neutral-400">Category scores · all tracked repositories</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { fetchHealthScoreCoverageCategoryCoverageQuery } from '../services/category-coverage.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { getHorizontalBarChartConfig, type HorizontalBarData } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { HealthScoreCoverageCategoryCount } from '~~/types/report/health-score-coverage-category-coverage.types';

// Display labels per the design copy, keyed by the pipe-derived `categoryKey`. Duplicated here
// rather than imported from config/signals.ts because that shared file is created by IN-1285 and
// isn't ready for this widget to depend on yet - see the types file for the merge-order
// explanation.
const CATEGORY_LABELS: Record<HealthScoreCoverageCategoryCount['categoryKey'], string> = {
  maintainerHealth: 'Maintainer health',
  developmentActivity: 'Development activity',
  securitySupplyChain: 'Security & supply chain',
};

const { data, isLoading, suspense } = fetchHealthScoreCoverageCategoryCoverageQuery();

onServerPrefetch(async () => {
  await suspense();
});

const categories = computed(() => data.value?.categories ?? []);
const reposTracked = computed(() => data.value?.reposTracked ?? 0);

const isEmpty = computed(() => !isLoading.value && reposTracked.value === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

const percentOf = (count: number, total: number): number => (total > 0 ? round1((count / total) * 100) : 0);

interface CategoryCoverageTooltipParam {
  dataIndex: number;
}

// Single-series horizontal bar chart, bars as raw scored-repo counts against an axis capped at
// the tracked-repo total (not a 0-100% axis) - per the ticket's own spec, which calls out "axis
// max = repos tracked" and a "n · pct%" label on each bar, distinct from the generic percent-axis
// pattern used by some sibling widgets.
const chartConfig = computed<ECOption>(() => {
  const rows: HealthScoreCoverageCategoryCount[] = categories.value;
  const total = reposTracked.value;

  const barData: HorizontalBarData[] = rows.map((row) => ({
    category: CATEGORY_LABELS[row.categoryKey] ?? row.categoryKey,
    value: row.scored,
  }));

  return getHorizontalBarChartConfig(barData, lfxColors.brand[500], {
    xAxis: { max: total },
    tooltip: {
      formatter: (params: unknown) => {
        const paramArray = params as CategoryCoverageTooltipParam[];
        const item = paramArray?.[0];
        if (!item) return '';
        const row = rows[item.dataIndex];
        if (!row) return '';
        return `${CATEGORY_LABELS[row.categoryKey] ?? row.categoryKey}: ${formatNumber(row.scored)} (${percentOf(row.scored, total)}%)`;
      },
    },
    series: [
      {
        label: {
          show: true,
          position: 'right',
          color: lfxColors.neutral[900],
          fontSize: 12,
          fontWeight: 600,
          formatter: (params: { dataIndex: number }) => {
            const row = rows[params.dataIndex];
            if (!row) return '';
            return `${formatNumber(row.scored)} · ${percentOf(row.scored, total)}%`;
          },
        },
      },
    ],
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageCategoryCoverage',
};
</script>
