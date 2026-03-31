<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <div class="flex items-center gap-2 mb-6 pb-2">
      <lfx-icon
        name="hearts"
        :size="16"
        class="text-neutral-900"
      />
      <h3 class="text-sm font-medium text-neutral-900">
        Liked Collections
        <span v-if="status === 'success'">({{ likedCollections.length }})</span>
      </h3>
      <hr class="border-neutral-200 flex-1 ml-1" />
    </div>

    <!-- Loading State -->
    <template v-if="status === 'pending'">
      <div :class="classDisplay">
        <template v-if="props.view === 'list'">
          <lfx-collection-list-item-loading
            v-for="i in 3"
            :key="i"
          />
        </template>
        <template v-else>
          <lfx-collection-card-loading
            v-for="i in 3"
            :key="i"
          />
        </template>
      </div>
    </template>

    <template v-else>
      <!-- Empty State -->
      <div
        v-if="isLikedCollectionsEmpty || status === 'error'"
        class="flex flex-col items-center justify-center py-10 gap-5 border border-neutral-200 rounded-lg"
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
        :class="classDisplay"
      >
        <template v-if="props.view === 'list'">
          <lfx-collection-list-item
            v-for="collection in likedCollections"
            :key="collection.slug"
            :collection="collection"
            variant="liked-collections"
            :show-like-count="true"
            @updated="handleLikeUpdated"
          />
        </template>
        <template v-else>
          <lfx-collection-card
            v-for="collection in likedCollections"
            :key="collection.slug"
            :collection="collection"
            variant="community"
            @updated="handleLikeUpdated"
          />
        </template>
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
import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import LfxCollectionCardLoading from '~/components/shared/components/collection-card-loading.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { useLikeCounts } from '~/components/modules/collection/composables/useLikeCounts';

const props = withDefaults(
  defineProps<{
    view?: string;
  }>(),
  {
    view: 'list',
  },
);

const { user } = storeToRefs(useAuthStore());
const { showToast } = useToastService();
const { likedCollectionsList } = storeToRefs(useCollectionsStore());

const params = computed(() => ({
  pageSize: 10,
  likedList: likedCollectionsList.value.length,
  user: user.value,
}));

const {
  data: likedData,
  status,
  error,
  refetch,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryLikedCollections(params, user);

const likedCollections = computed(() => likedData.value?.data || []);
const isLikedCollectionsEmpty = computed(() => likedCollections.value.length === 0);

const likedCollectionIds = computed(() => likedCollections.value.map((c) => c.id));
useLikeCounts(likedCollectionIds);

const classDisplay = computed(() => {
  if (props.view === 'grid') {
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-fr';
  }
  return 'flex flex-col';
});

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

const handleLikeUpdated = () => {
  refetch();
};

watch(user, () => {
  refetch();
});
</script>

<script lang="ts">
export default {
  name: 'LfxLikedCollections',
};
</script>
