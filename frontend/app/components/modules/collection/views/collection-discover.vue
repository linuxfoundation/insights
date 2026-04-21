<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Header Section -->
  <div class="container bg-white">
    <section class="flex items-start justify-between gap-4 border-b border-neutral-200 pt-8 pb-6 md:pt-16 md:pb-10">
      <div class="flex-1">
        <h1 class="font-secondary font-light text-2xl md:text-4xl leading-tight md:leading-[56px] text-neutral-900">
          Discover Collections
        </h1>
        <p class="text-sm md:text-base leading-5 md:leading-6 text-neutral-600">
          Explore and curate open source projects organized into themed collections.
        </p>
      </div>
      <lf-create-collection-button
        class="!hidden md:!flex"
        @created="handleCollectionCreated"
      />
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
            v-for="collection in isMobile ? curatedCollections.slice(0, 3) : curatedCollections"
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
          <!-- Desktop: all community collections as cards -->
          <lfx-collection-card
            v-for="collection in isMobile ? communityCollections.slice(0, 3) : communityCollections"
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
            mobile-layout="list"
            @created="refetchMyCollections"
          >
            <!-- Mobile: dedicated mobile card -->
            <template v-if="isMobile">
              <lfx-my-collection-card-mobile
                v-for="collection in myCollections.slice(0, 5)"
                :key="collection.slug"
                :collection="collection"
                @deleted="handleCollectionUpdated"
                @updated="handleCollectionUpdated"
              />
            </template>
            <!-- Desktop: standard card -->
            <template v-else>
              <lfx-collection-card
                v-for="collection in myCollections"
                :key="collection.slug"
                :collection="collection"
                variant="my-collections"
                @deleted="handleCollectionUpdated"
                @updated="handleCollectionUpdated"
              />
            </template>
          </lfx-collection-section>
        </section>

        <!-- Liked Collections Section -->
        <lfx-liked-collections />
      </template>
    </div>
  </div>

  <!-- Mobile floating create button -->
  <teleport to="body">
    <div
      v-if="isMobile"
      class="fixed bottom-4 z-50 left-1/2 transform -translate-x-1/2"
    >
      <lf-create-collection-button @created="handleCollectionCreated" />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfCreateCollectionButton from '../components/create-modal/create-button.vue';
import LfxLikedCollections from '../components/discovery/liked-collections.vue';
import LfxMyCollectionCardMobile from '../components/my-collection-card-mobile.vue';
import LfxCollectionSection from '~/components/shared/components/collection-section.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useLikeCounts } from '~/components/modules/collection/composables/useLikeCounts';
import useResponsive from '~/components/shared/utils/responsive';

import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const { pageWidth } = useResponsive();
const isMobile = computed(() => pageWidth.value > 0 && pageWidth.value < 768);

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
