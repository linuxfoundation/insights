// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed, watch, type ComputedRef } from 'vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';

export function useLikeCounts(collectionIds: ComputedRef<string[]>) {
  const collectionsStore = useCollectionsStore();

  // Only fetch counts for IDs not yet in the store to avoid
  // growing query keys on infinite scroll and redundant refetches.
  const missingIds = computed(() =>
    collectionIds.value.filter((id) => collectionsStore.getLikeCount(id) === undefined),
  );

  const { data, isLoading, refetch } = COLLECTIONS_API_SERVICE.fetchLikeCounts(missingIds);

  watch(
    data,
    (counts) => {
      if (counts) {
        collectionsStore.setLikeCounts(counts);
      }
    },
    { immediate: true },
  );

  return {
    isLoading,
    refetch,
  };
}
