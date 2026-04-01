<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Header Section -->
  <div class="container bg-white">
    <section class="flex items-start justify-between gap-4 border-b border-neutral-200 pt-16 pb-10">
      <div class="flex-1">
        <h1 class="font-secondary font-light text-4xl leading-[56px] text-neutral-900">Discover Collections</h1>
        <p class="text-base leading-6 text-neutral-600">
          Explore and curate open source projects organized into themed collections.
        </p>
      </div>
      <lf-create-collection-button @created="handleCollectionCreated" />
    </section>
  </div>

  <div class="container">
    <div class="flex flex-col gap-10 pt-10">
      <!-- Curated Collections Section -->
      <section class="border-b border-neutral-200 pb-10">
        <lfx-collection-section
          type="curated"
          :status="curatedStatus"
          :error="curatedError"
          error-message="Error fetching curated collections"
          :is-empty="isCuratedEmpty"
        >
          <lfx-collection-card
            v-for="collection in curatedCollections"
            :key="collection.slug"
            :collection="collection"
            variant="curated"
            @updated="handleCollectionUpdated"
          />
        </lfx-collection-section>
      </section>

      <!-- Community Collections Section -->
      <section class="border-b border-neutral-200 pb-10">
        <lfx-collection-section
          type="community"
          :status="communityStatus"
          :error="communityError"
          error-message="Error fetching community collections"
          :is-empty="isCommunityEmpty"
          @created="refetchCommunityCollections"
        >
          <lfx-collection-card
            v-for="collection in communityCollections"
            :key="collection.slug"
            :collection="collection"
            variant="community"
            @updated="handleCollectionUpdated"
          />
        </lfx-collection-section>
      </section>

      <template v-if="!!user">
        <!-- My Collections Section -->
        <section>
          <lfx-collection-section
            type="my-collections"
            :status="myCollectionsStatus"
            :error="myCollectionsError"
            error-message="Error fetching your collections"
            :is-empty="isMyCollectionsEmpty"
            @created="refetchMyCollections"
          >
            <lfx-collection-card
              v-for="collection in myCollections"
              :key="collection.slug"
              :collection="collection"
              variant="my-collections"
              @updated="handleCollectionUpdated"
            />
          </lfx-collection-section>
        </section>

        <!-- Liked Collections Section -->
        <lfx-liked-collections />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfCreateCollectionButton from '../components/create-modal/create-button.vue';
import LfxLikedCollections from '../components/discovery/liked-collections.vue';
import LfxCollectionSection from '~/components/shared/components/collection-section.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useLikeCounts } from '~/components/modules/collection/composables/useLikeCounts';

import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const {
  data: curatedData,
  status: curatedStatus,
  error: curatedError,
  refetch: refetchCuratedCollections,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCuratedCollections();

const {
  data: communityData,
  status: communityStatus,
  error: communityError,
  refetch: refetchCommunityCollections,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCommunityCollections();

const {
  data: myCollectionsData,
  status: myCollectionsStatus,
  error: myCollectionsError,
  refetch: refetchMyCollections,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryMyCollections(user.value);

const curatedCollections = computed(() => curatedData.value?.data || []);
const communityCollections = computed(() => communityData.value?.data || []);
const myCollections = computed(() => myCollectionsData.value?.data || []);

const isCuratedEmpty = computed(() => COLLECTIONS_API_SERVICE.isEmptyData(curatedCollections.value));
const isCommunityEmpty = computed(() => COLLECTIONS_API_SERVICE.isEmptyData(communityCollections.value));
const isMyCollectionsEmpty = computed(() => COLLECTIONS_API_SERVICE.isEmptyData(myCollections.value));

const allCollectionIds = computed(() => {
  const ids = [...curatedCollections.value, ...communityCollections.value, ...myCollections.value].map((c) => c.id);
  return [...new Set(ids)];
});

useLikeCounts(allCollectionIds);

const handleCollectionCreated = () => {
  refetchMyCollections();
  refetchCommunityCollections();
};

const handleCollectionUpdated = () => {
  refetchCuratedCollections();
  refetchCommunityCollections();
  refetchMyCollections();
};

watch(user, () => {
  refetchCommunityCollections();
  refetchMyCollections();
});
</script>
<script lang="ts">
export default {
  name: 'LfxCollectionDiscover',
};
</script>
