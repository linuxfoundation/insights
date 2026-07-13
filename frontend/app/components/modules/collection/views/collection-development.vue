<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-5 lg:py-10">
    <h1 class="text-heading-3 font-secondary font-bold mb-5">Development</h1>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching collection development activity"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <lfx-card class="p-5">
          <p class="text-sm text-neutral-500 mb-2">Active contributors (last 365 days)</p>
          <div class="text-data-display-1">{{ formatNumber(data?.activeContributorsLast365Days || 0) }}</div>
        </lfx-card>
        <lfx-card class="p-5">
          <p class="text-sm text-neutral-500 mb-2">Active organizations (last 365 days)</p>
          <div class="text-data-display-1">{{ formatNumber(data?.activeOrganizationsLast365Days || 0) }}</div>
        </lfx-card>
      </div>
    </lfx-project-load-state>
  </div>
</template>

<script setup lang="ts">
import { useRequestFetch } from 'nuxt/app';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';

const props = defineProps<{
  slug: string;
}>();

const requestFetch = useRequestFetch();

const { data, status, error } = COLLECTIONS_API_SERVICE.fetchCollectionDevelopment(props.slug, requestFetch);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDevelopmentView',
};
</script>
