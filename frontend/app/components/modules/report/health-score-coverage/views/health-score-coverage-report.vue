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
    <div
      v-if="isError"
      class="flex flex-col items-center justify-center py-10 gap-2"
    >
      <lfx-icon
        name="eyes"
        :size="40"
        class="text-neutral-300"
      />
      <p class="text-sm text-neutral-500">No data available</p>
    </div>
    <div
      v-else
      class="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
    >
      <div
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="bg-neutral-50 rounded-lg p-3 md:p-4 flex flex-col gap-1"
      >
        <div class="text-body-2 text-neutral-500">{{ kpi.label }}</div>
        <div v-if="isLoading">
          <lfx-skeleton
            height="32px"
            width="80%"
          />
        </div>
        <span
          v-else
          class="text-heading-3 md:text-heading-2 font-bold text-neutral-900"
        >
          {{ kpi.value }}
        </span>
      </div>
    </div>

    <!-- How projects score -->
    <div class="flex flex-col gap-6">
      <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900">How projects score</h2>
    </div>

    <!-- What we can see -->
    <div class="flex flex-col gap-6">
      <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900">What we can see</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { HEALTH_SCORE_COVERAGE_API_SERVICE } from '../services/health-score-coverage.api.service';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber, formatDate } from '~/components/shared/utils/formatter';

const { data: glanceData, status } = HEALTH_SCORE_COVERAGE_API_SERVICE.fetchGlance();

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
