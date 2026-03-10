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
      <lf-create-collection-button />
    </section>

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
          />
        </lfx-collection-section>
      </section>

      <template v-if="isLfInsightsTeamMember">
        <!-- Community Collections Section -->
        <section class="border-b border-neutral-200 pb-10">
          <lfx-collection-section
            type="community"
            :status="communityStatus"
            :error="communityError"
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
            :status="myCollectionsStatus"
            :error="myCollectionsError"
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
              type="solid"
            />
            <h3 class="text-sm font-medium text-neutral-900">Liked Collections ({{ likedCollections.length }})</h3>
          </div>
          <div
            v-if="!isLikedCollectionsEmpty"
            class="flex flex-col gap-0"
          >
            <lfx-collection-list-item
              v-for="collection in likedCollections"
              :key="collection.slug"
              :collection="collection"
            />
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center py-10 gap-5"
          >
            <div class="flex items-center justify-center h-14 w-14 rounded-full bg-accent-100">
              <lfx-icon
                name="hearts"
                :size="32"
                class="text-accent-500"
              />
            </div>
            <div class="flex flex-col items-center justify-center gap-3">
              <h3 class="text-xl font-bold font-secondary leading-8">No liked collections yet</h3>
              <p class="text-sm text-neutral-600">
                Explore curated and community collections, and like the ones that inspire you. They'll appear here.
              </p>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { storeToRefs } from 'pinia';
import { isArray } from 'lodash-es';
import LfCreateCollectionButton from '../components/create-modal/create-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCollectionSection from '~/components/shared/components/collection-section.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxCollectionListItem from '~/components/shared/components/collection-list-item.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
// TODO: remove this once we have everything done and tested
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import type { Collection } from '~~/types/collection';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const {
  data: curatedData,
  status: curatedStatus,
  error: curatedError,
  suspense: curatedSuspense,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCuratedCollections();

const {
  data: communityData,
  status: communityStatus,
  error: communityError,
  suspense: communitySuspense,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCommunityCollections();

const {
  data: myCollectionsData,
  status: myCollectionsStatus,
  error: myCollectionsError,
  suspense: myCollectionsSuspense,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryMyCollections();

// TODO: Uncomment when backend for liked collections is ready
// const {
//   data: likedData,
//   status: likedStatus,
//   error: likedError,
//   suspense: likedSuspense,
// } = COLLECTIONS_API_SERVICE.fetchDiscoveryLikedCollections();

const curatedCollections = computed(() => curatedData.value?.data || []);
const communityCollections = computed(() => communityData.value?.data || []);
const myCollections = computed(() => myCollectionsData.value?.data || []);
// TODO: Uncomment when backend for liked collections is ready
const likedCollections = computed<Collection[]>(() => []);

const isCuratedEmpty = computed(() => isEmptyData(curatedCollections.value));
const isCommunityEmpty = computed(() => isEmptyData(communityCollections.value));
const isMyCollectionsEmpty = computed(() => isEmptyData(myCollections.value));
const isLikedCollectionsEmpty = computed(() => isEmptyData(likedCollections.value));

// TODO: remove this once we have everything done and tested
const isLfInsightsTeamMember = computed(() => {
  return user.value?.isLfInsightsTeamMember || false;
});

const isEmptyData = (value: Collection[] | null | undefined) => {
  // check if the value is null or undefined or the length of the value is 0
  if (value === null || value === undefined || value?.length === 0 || !isArray(value)) {
    return true;
  }
  return false;
};

onServerPrefetch(async () => {
  await Promise.all([curatedSuspense(), communitySuspense(), myCollectionsSuspense()]);
});
</script>
<script lang="ts">
export default {
  name: 'LfxCollectionDiscover',
};
</script>
