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
        Each category is its own ring, not slices of one pie, since the three percentages don't sum to a whole - every
        repo can count toward more than one category.
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
        class="flex flex-wrap items-center justify-center gap-8 sm:gap-12 py-4"
      >
        <div
          v-for="ring in rings"
          :key="ring.categoryKey"
          class="flex flex-col items-center gap-2"
          :title="`${formatNumber(ring.scored)} of ${formatNumber(reposTracked)} repositories`"
        >
          <div class="relative h-28 w-28 sm:h-32 sm:w-32">
            <client-only>
              <lfx-chart
                :config="ring.chartConfig"
                :animation="true"
              />
            </client-only>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="text-heading-4 font-secondary font-semibold text-neutral-900">{{ ring.percent }}%</span>
            </div>
          </div>
          <p class="text-body-2 text-neutral-600 text-center">{{ ring.label }}</p>
        </div>
      </div>

      <p class="text-xs text-neutral-400">Category scores · all tracked repositories</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';

import { formatNumber } from '~/components/shared/utils/formatter';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { lfxColors } from '~/config/styles/colors';
import type { HealthScoreCoverageCategoryCount } from '~~/types/report/health-score-coverage-category-coverage.types';

import { fetchHealthScoreCoverageCategoryCoverageQuery } from '../services/category-coverage.query';

// Display labels per the design copy, keyed by the pipe-derived `categoryKey`. Duplicated here
// rather than imported from config/signals.ts because that shared file is created by IN-1285 and
// isn't ready for this widget to depend on yet - see the types file for the merge-order
// explanation.
const CATEGORY_LABELS: Record<HealthScoreCoverageCategoryCount['categoryKey'], string> = {
  maintainerHealth: 'Maintainer health',
  developmentActivity: 'Development activity',
  securitySupplyChain: 'Security & supply chain',
};

// Category-color scheme for this widget's rings. signal-scores.vue now uses a continuous heatmap
// value-scale and signal-availability-lf.vue now uses the LF/non-LF blue-purple convention, so
// this is no longer shared with either — kept here as this widget's own category identity
// coloring, distinct from the report-wide LF-vs-other convention used elsewhere.
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

interface CategoryRing {
  categoryKey: HealthScoreCoverageCategoryCount['categoryKey'];
  label: string;
  percent: number;
  scored: number;
  chartConfig: ECOption;
}

// Design feedback: the three category percentages don't sum to a whole (a repo can count toward
// every category at once), so a single sliced donut misrepresented them as parts of one pie. Each
// category now gets its own progress ring instead, reusing the same full-gauge pattern as the
// project overview's health-score-ring.vue rather than inventing a new chart type.
const rings = computed<CategoryRing[]>(() => {
  const total = reposTracked.value;

  return categories.value.map((row) => {
    const percent = total === 0 ? 0 : Math.round((row.scored / total) * 1000) / 10;

    return {
      categoryKey: row.categoryKey,
      label: CATEGORY_LABELS[row.categoryKey] ?? row.categoryKey,
      percent,
      scored: row.scored,
      chartConfig: getGaugeChartConfig({
        value: percent,
        maxValue: 100,
        gaugeType: 'full',
        name: '',
        graphOnly: true,
        lineColor: CATEGORY_COLORS[row.categoryKey] ?? lfxColors.brand[500],
        lineWidth: 10,
      }),
    };
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageCategoryCoverage',
};
</script>
