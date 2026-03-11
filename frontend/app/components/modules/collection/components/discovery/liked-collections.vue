<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <div class="flex items-center gap-2 mb-6 pb-2 border-b border-neutral-200">
      <lfx-icon
        name="heart"
        :size="16"
        class="text-danger-500"
        type="solid"
      />
      <h3 class="text-sm font-medium text-neutral-900">
        Liked Collections
        <span v-if="status === 'success'">({{ likedCollections.length }})</span>
      </h3>
    </div>

    <!-- Loading State -->
    <template v-if="status === 'pending'">
      <div class="flex flex-col gap-0">
        <lfx-collection-list-item-loading
          v-for="i in 3"
          :key="i"
        />
      </div>
    </template>

    <template v-else>
      <!-- Empty State -->
      <div
        v-if="isLikedCollectionsEmpty || status === 'error'"
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

      <!-- Collections List -->
      <div
        v-else
        class="flex flex-col gap-0"
      >
        <lfx-collection-list-item
          v-for="collection in likedCollections"
          :key="collection.slug"
          :collection="collection"
        />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCollectionListItem from '~/components/shared/components/collection-list-item.vue';
import LfxCollectionListItemLoading from '~/components/modules/collection/components/list/collection-list-item-loading.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { useCollectionsStore } from '~/components/modules/collection/services/collections.store';

const { showToast } = useToastService();
const { likedCollectionsList } = storeToRefs(useCollectionsStore());

const currentCount = computed(() => likedCollectionsList.value.length);

const { data: likedData, status, error } = COLLECTIONS_API_SERVICE.fetchDiscoveryLikedCollections(currentCount);

const likedCollections = computed(() => likedData.value?.data || []);
const isLikedCollectionsEmpty = computed(() => likedCollections.value.length === 0);

watch(
  () => error.value,
  (err) => {
    if (err) {
      setTimeout(() => {
        showToast('Error fetching liked collections', ToastTypesEnum.negative, undefined, 10000);
      }, 500);
    }
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'LfxLikedCollections',
};
</script>
