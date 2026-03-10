<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-section
    type="curated"
    :status="status"
    :error="error"
    error-message="Error fetching featured collections"
    :is-empty="isEmpty"
  >
    <lfx-collection-card
      v-for="collection in carouselData"
      :key="collection.slug"
      :collection="collection"
      variant="curated"
    />
  </lfx-collection-section>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '../services/explore.api.service';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxCollectionSection from '~/components/shared/components/collection-section.vue';
import { isEmptyData } from '~/components/shared/utils/helper';
import type { Collection } from '~~/types/collection';

const { data: featuredCollectionsData, status, error, suspense } = EXPLORE_API_SERVICE.fetchFeaturedCollections();

const carouselData = computed(() => featuredCollectionsData.value?.data as Collection[]);

const isEmpty = computed(() => isEmptyData(carouselData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreFeaturedCollection',
};
</script>
