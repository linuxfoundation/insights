<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <!-- Header Section -->
    <section class="flex items-start justify-between gap-4 border-b border-neutral-200 pt-16 pb-10">
      <div class="flex-1">
        <h1 class="font-secondary font-light text-4xl leading-[56px] text-neutral-900">Discover Collections</h1>
        <p class="text-base leading-6 text-neutral-600">
          Explore and curate open source projects organized into themed collections.
        </p>
      </div>
      <!-- TODO: wire the create collection modal here which is part of another PR. Revisit this once that is merged -->
      <lfx-button
        type="secondary"
        button-style="pill"
      >
        <lfx-icon
          name="rectangle-history-circle-plus"
          :size="16"
        />
        <span>Create collection</span>
      </lfx-button>
    </section>

    <div class="flex flex-col gap-10 pt-10">
      <!-- Curated Collections Section -->
      <section class="border-b border-neutral-200 pb-10">
        <lfx-collection-section
          type="curated"
          :status="discoveryStatus"
          :error="discoveryError"
          error-message="Error fetching curated collections"
          :is-empty="isCuratedEmpty"
        >
          <lfx-collection-card
            v-for="collection in curatedCollections"
            :key="collection.slug"
            :collection="collection"
            variant="curated"
          />
        </lfx-collection-section>
      </section>

      <!-- Community Collections Section -->
      <section class="border-b border-neutral-200 pb-10">
        <lfx-collection-section
          type="community"
          :status="discoveryStatus"
          :error="discoveryError"
          error-message="Error fetching community collections"
          :is-empty="isCommunityEmpty"
        >
          <lfx-collection-card
            v-for="collection in communityCollections"
            :key="collection.slug"
            :collection="collection"
            variant="community"
          />
        </lfx-collection-section>
      </section>

      <!-- My Collections Section -->
      <section>
        <lfx-collection-section
          type="my-collections"
          :status="discoveryStatus"
          :error="discoveryError"
          error-message="Error fetching your collections"
          :is-empty="isMyCollectionsEmpty"
        >
          <lfx-collection-card
            v-for="collection in myCollections"
            :key="collection.slug"
            :collection="collection"
            variant="my-collections"
          />
        </lfx-collection-section>
      </section>

      <!-- Liked Collections Section -->
      <section>
        <div class="flex items-center gap-2 mb-6 pb-2 border-b border-neutral-200">
          <lfx-icon
            name="heart"
            :size="16"
            class="text-danger-500"
            icon-style="solid"
          />
          <h3 class="text-sm font-medium text-neutral-900">Liked Collections ({{ likedCollections.length }})</h3>
        </div>
        <div class="flex flex-col gap-0">
          <lfx-collection-list-item
            v-for="collection in likedCollections"
            :key="collection.slug"
            :collection="collection"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCollectionSection from '~/components/shared/components/collection-section.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxCollectionListItem from '~/components/shared/components/collection-list-item.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { isEmptyData } from '~/components/shared/utils/helper';

const {
  data: discoveryData,
  status: discoveryStatus,
  error: discoveryError,
  suspense: discoverySuspense,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCollections();

const curatedCollections = computed(() => discoveryData.value?.curatedCollections || []);
const communityCollections = computed(() => discoveryData.value?.communityCollections || []);
const myCollections = computed(() => discoveryData.value?.myCollections || []);
const likedCollections = computed(() => discoveryData.value?.likedCollections || []);

const isCuratedEmpty = computed(() => isEmptyData(curatedCollections.value as unknown as Record<string, unknown>[]));
const isCommunityEmpty = computed(() =>
  isEmptyData(communityCollections.value as unknown as Record<string, unknown>[]),
);
const isMyCollectionsEmpty = computed(() => isEmptyData(myCollections.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await discoverySuspense();
});
</script>
<script lang="ts">
export default {
  name: 'LfxCollectionDiscover',
};
</script>
