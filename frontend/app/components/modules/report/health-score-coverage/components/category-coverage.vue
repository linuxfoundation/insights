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
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Availability</p>
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
        class="h-[320px] sm:h-[380px]"
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
import { getDonutChartConfig, type DonutChartData } from '~/components/uikit/chart/configs/pie.chart';
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

// Same category-color scheme as signal-scores.vue/signal-availability-lf.vue, reused here for
// consistency across the report's category-keyed widgets.
const CATEGORY_COLORS: Record<HealthScoreCoverageCategoryCount['categoryKey'], string> = {
  maintainerHealth: lfxColors.brand[500],
  securitySupplyChain: lfxColors.violet[500],
  developmentActivity: lfxColors.positive[500],
};

const { data, isLoading, suspense } = fetchHealthScoreCoverageCategoryCoverageQuery();

onServerPrefetch(async () => {
  await suspense();
});

const categories = computed(() => data.value?.categories ?? []);
const reposTracked = computed(() => data.value?.reposTracked ?? 0);

const isEmpty = computed(() => !isLoading.value && reposTracked.value === 0);

// Donut chart, one slice per category. Donuts read most naturally as proportions, so the slice
// label shows percentage of repos tracked (ECharts pie default), with the raw scored count added
// alongside it in the tooltip - consistent with how sibling widgets in this report pair a percent
// with its underlying count.
const chartConfig = computed<ECOption>(() => {
  const rows: HealthScoreCoverageCategoryCount[] = categories.value;
  const total = reposTracked.value;

  const donutData: DonutChartData[] = rows.map((row) => ({
    name: CATEGORY_LABELS[row.categoryKey] ?? row.categoryKey,
    value: row.scored,
    color: CATEGORY_COLORS[row.categoryKey] ?? lfxColors.brand[500],
  }));

  return getDonutChartConfig(donutData, {
    tooltip: {
      formatter: (params: unknown) => {
        const { name, value, percent, color } = params as {
          name: string;
          value: number;
          percent: number;
          color: string;
        };
        return `
          <div style="display: flex; flex-direction: row; align-items: center;
            justify-content: space-between; min-width: 200px; font-weight: 400;
            font-size: 12px; color: ${lfxColors.neutral[900]};">
            <span style="font-weight: 400; font-size: 12px; margin-right: 10px;">
              <span style="background-color: ${color}; display: inline-block;
                border-radius: 100%; height: 8px; width: 8px; margin-right: 4px;"></span>
              ${name}
            </span>
            <span style="font-weight: 500; font-size: 12px;">
              ${percent}% (${formatNumber(value)} of ${formatNumber(total)})
            </span>
          </div>`;
      },
    },
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageCategoryCoverage',
};
</script>
