// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useAuth } from '~~/composables/useAuth';
import type { Collection } from '~~/types/collection';
import type { Pagination } from '~~/types/shared/pagination';

export type CollectionViewType = 'grid' | 'list';

export const useCollectionsStore = defineStore('collections', () => {
  const likedCollectionIds = ref<Set<string>>(new Set());
  const isLikedCollectionsLoaded = ref(false);
  const likeCounts = ref<Record<string, number>>({});

  const likedCollectionsList = computed(() => Array.from(likedCollectionIds.value));

  const isLiked = (collectionId: string): boolean => likedCollectionIds.value.has(collectionId);

  const setLikedCollections = (collectionIds: string[]) => {
    likedCollectionIds.value = new Set(collectionIds);
  };

  const addLikedCollection = (collectionId: string): boolean => {
    const { isAuthenticated, login } = useAuth();

    if (!isAuthenticated.value) {
      login(window.location.pathname + window.location.search + window.location.hash);
      return false;
    }

    likedCollectionIds.value = new Set([...likedCollectionIds.value, collectionId]);
    return true;
  };

  const removeLikedCollection = (collectionId: string) => {
    const newSet = new Set(likedCollectionIds.value);
    newSet.delete(collectionId);
    likedCollectionIds.value = newSet;
  };

  const toggleLike = (collectionId: string) => {
    if (isLiked(collectionId)) {
      removeLikedCollection(collectionId);
    } else {
      addLikedCollection(collectionId);
    }
  };

  const fetchAndSetLikedCollections = async () => {
    try {
      const response = await $fetch<Pagination<Collection>>('/api/collection/like', {
        params: { page: 0, pageSize: 100000 },
      });
      const ids = response.data.map((collection) => collection.id);
      setLikedCollections(ids);
      isLikedCollectionsLoaded.value = true;
    } catch (error) {
      console.error('Error fetching liked collections:', error);
    }
  };

  const getLikeCount = (collectionId: string): number | undefined => {
    return likeCounts.value[collectionId];
  };

  const setLikeCounts = (counts: Record<string, number>) => {
    likeCounts.value = { ...likeCounts.value, ...counts };
  };

  const adjustLikeCount = (collectionId: string, delta: number, fallback?: number) => {
    const current = likeCounts.value[collectionId] ?? fallback ?? 0;
    likeCounts.value = { ...likeCounts.value, [collectionId]: Math.max(0, current + delta) };
  };

  const clearLikedCollections = () => {
    likedCollectionIds.value = new Set();
    isLikedCollectionsLoaded.value = false;
  };

  return {
    likedCollectionIds,
    likedCollectionsList,
    isLikedCollectionsLoaded,
    likeCounts,
    isLiked,
    getLikeCount,
    setLikeCounts,
    adjustLikeCount,
    setLikedCollections,
    addLikedCollection,
    removeLikedCollection,
    toggleLike,
    fetchAndSetLikedCollections,
    clearLikedCollections,
  };
});
