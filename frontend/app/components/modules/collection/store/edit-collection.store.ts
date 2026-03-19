// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Collection } from '~~/types/collection';

export interface EditCollectionData {
  collection: Collection;
  onUpdated?: (collection: Collection) => void;
}

export const useEditCollectionStore = defineStore('editCollection', () => {
  const isEditModalOpen = ref(false);
  const editData = ref<EditCollectionData | null>(null);

  const openEditModal = (data: EditCollectionData) => {
    editData.value = data;
    isEditModalOpen.value = true;
  };

  const closeEditModal = () => {
    isEditModalOpen.value = false;
  };

  const handleUpdated = (collection: Collection) => {
    if (editData.value?.onUpdated) {
      editData.value.onUpdated(collection);
    }
    closeEditModal();
  };

  return {
    isEditModalOpen,
    editData,
    openEditModal,
    closeEditModal,
    handleUpdated,
  };
});
