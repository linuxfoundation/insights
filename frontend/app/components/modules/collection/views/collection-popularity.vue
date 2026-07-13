<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-5 lg:py-10">
    <h1 class="text-heading-3 font-secondary font-bold mb-5">Popularity</h1>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching collection popularity"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <lfx-card class="p-5">
          <p class="text-sm text-neutral-500 mb-2">Stars</p>
          <div class="flex items-center gap-4">
            <div class="text-data-display-1">{{ formatNumber(data?.totalStars || 0) }}</div>
            <lfx-delta-display :summary="starsSummary" />
          </div>
        </lfx-card>
        <lfx-card class="p-5">
          <p class="text-sm text-neutral-500 mb-2">Forks</p>
          <div class="flex items-center gap-4">
            <div class="text-data-display-1">{{ formatNumber(data?.totalForks || 0) }}</div>
            <lfx-delta-display :summary="forksSummary" />
          </div>
        </lfx-card>
      </div>
    </lfx-project-load-state>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRequestFetch } from 'nuxt/app';
import type { Summary } from '~~/types/shared/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';

const props = defineProps<{
  slug: string;
}>();

const requestFetch = useRequestFetch();

const { data, status, error } = COLLECTIONS_API_SERVICE.fetchCollectionPopularity(props.slug, requestFetch);

const toSummary = (current: number, previous: number): Summary => {
  const changeValue = current - previous;
  return {
    current,
    previous,
    changeValue,
    percentageChange: previous > 0 ? (changeValue / previous) * 100 : undefined,
    periodFrom: '',
    periodTo: '',
  };
};

const starsSummary = computed(() => toSummary(data.value?.totalStars || 0, data.value?.starsPrevious365Days || 0));
const forksSummary = computed(() => toSummary(data.value?.totalForks || 0, data.value?.forksPrevious365Days || 0));
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionPopularityView',
};
</script>
