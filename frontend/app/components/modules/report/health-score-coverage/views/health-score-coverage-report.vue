<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-6 md:py-10 flex flex-col gap-6 md:gap-8">
    <!-- Header -->
    <div>
      <h1 class="text-heading-3 md:text-heading-1 font-secondary font-bold text-neutral-900 mb-2">
        Health Score Coverage
      </h1>
      <p class="text-body-2 md:text-body-1 text-neutral-600">
        Where every project tracked in LFX Insights lands on the health score, and how much of the underlying data we
        can actually see.
      </p>
    </div>

    <!-- Badges -->
    <div class="flex items-center gap-2 flex-wrap">
      <span
        class="inline-flex items-center bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      >
        <lfx-skeleton
          v-if="isLoading"
          height="12px"
          width="80px"
        />
        <template v-else-if="glanceData">Updated {{ formatDate(glanceData.updatedAt, 'dd MMM yyyy') }}</template>
      </span>
      <span
        class="inline-flex items-center bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      >
        Health Score v2
      </span>
    </div>

    <!-- KPI row -->
    <kpi-row
      :kpi-cards="kpiCards"
      :is-loading="isLoading"
      :is-error="isError"
    />

    <!-- How projects score -->
    <div class="flex flex-col gap-6">
      <div>
        <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900">How projects score</h2>
        <p class="text-body-2 text-neutral-500 mt-1">
          Health scores, maintenance state, and how repositories perform on each signal.
        </p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <band-distribution />
        <lifecycle-distribution />
      </div>
      <signal-scores />
    </div>

    <!-- What we can see -->
    <div class="flex flex-col gap-6">
      <div>
        <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900">What we can see</h2>
        <p class="text-body-2 text-neutral-500 mt-1">
          A health score needs two of the three categories, and a category needs enough of its own signals. Some
          projects score lower simply because less of their data reaches us.
        </p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <category-coverage />
        <signal-availability />
      </div>
      <signal-availability-lf />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <category-maximum-table />
        <github-security-funnel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { HEALTH_SCORE_COVERAGE_API_SERVICE } from '../services/health-score-coverage.api.service';
import KpiRow from '../components/kpi-row.vue';
import BandDistribution from '../components/band-distribution.vue';
import LifecycleDistribution from '../components/lifecycle-distribution.vue';
import SignalScores from '../components/signal-scores.vue';
import CategoryCoverage from '../components/category-coverage.vue';
import SignalAvailability from '../components/signal-availability.vue';
import SignalAvailabilityLf from '../components/signal-availability-lf.vue';
import CategoryMaximumTable from '../components/category-maximum-table.vue';
import GithubSecurityFunnel from '../components/github-security-funnel.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { formatNumber, formatDate } from '~/components/shared/utils/formatter';

const { data: glanceData, status, suspense } = HEALTH_SCORE_COVERAGE_API_SERVICE.fetchGlance();

onServerPrefetch(async () => {
  await suspense();
});

const isLoading = computed(() => status.value === 'pending');
const isError = computed(() => status.value === 'error');

const kpiCards = computed(() => [
  { label: 'Repositories tracked', value: formatNumber(glanceData.value?.reposTracked ?? 0) },
  { label: 'Repositories scored', value: formatNumber(glanceData.value?.reposScored ?? 0) },
  { label: 'Projects tracked', value: formatNumber(glanceData.value?.projectsTracked ?? 0) },
  { label: 'Projects scored', value: formatNumber(glanceData.value?.projectsScored ?? 0) },
  { label: 'Projects partially scored', value: formatNumber(glanceData.value?.projectsPartial ?? 0) },
]);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageReport',
};
</script>
