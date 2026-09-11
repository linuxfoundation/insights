<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 07 "Repositories scoring full marks" component for the Health Score Coverage
  report (IN-1292, epic IN-1276). Not yet wired into health-score-coverage-report.vue - see
  health-score-coverage-category-maximum.types.ts for why.

  Named `category-maximum-table.vue` (not `category-maximum.vue`) per the ticket's own file list,
  matching the sibling table widget's `github-security-funnel.vue` convention of suffixing the
  component filename with its layout shape.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Availability</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Repositories scoring full marks
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">Repositories reaching the maximum in each category.</p>

      <div v-if="isLoading">
        <lfx-skeleton
          height="180px"
          width="100%"
        />
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[180px]"
      >
        <p class="text-neutral-500">No health score data available.</p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <lfx-table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Maximum</th>
              <th>Repositories at maximum</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in categories"
              :key="category.categoryKey"
            >
              <td>{{ category.label }}</td>
              <td>{{ category.maximum }}</td>
              <td>{{ formatNumber(category.reposAtMaximum) }}</td>
            </tr>
          </tbody>
        </lfx-table>
      </div>

      <p class="text-xs text-neutral-400">
        Security is the hardest to max out: it needs all four of its signals present and strong at once.
      </p>

      <p class="text-xs text-neutral-400">Category scores · all scored repositories</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { fetchHealthScoreCoverageCategoryMaximumQuery } from '../services/category-maximum.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTable from '~/components/uikit/table/table.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { HealthScoreCoverageCategoryMaximumCount } from '~~/types/report/health-score-coverage-category-maximum.types';

const { data, isLoading, suspense } = fetchHealthScoreCoverageCategoryMaximumQuery();

onServerPrefetch(async () => {
  await suspense();
});

const categories = computed<HealthScoreCoverageCategoryMaximumCount[]>(() => data.value?.categories ?? []);
const reposTracked = computed(() => data.value?.reposTracked ?? 0);

const isEmpty = computed(() => !isLoading.value && reposTracked.value === 0);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageCategoryMaximumTable',
};
</script>
