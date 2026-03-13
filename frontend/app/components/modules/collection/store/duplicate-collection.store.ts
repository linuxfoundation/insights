// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Collection } from '~~/types/collection';
import type { CreateCollectionForm } from '~/components/modules/collection/config/create-collection.config';

export interface DuplicateCollectionData {
  collection: Collection;
  onCreated?: (form: CreateCollectionForm) => void;
}

export const useDuplicateCollectionStore = defineStore('duplicateCollection', () => {
  const isDuplicateModalOpen = ref(false);
  const duplicateData = ref<DuplicateCollectionData | null>(null);

  const openDuplicateModal = (data: DuplicateCollectionData) => {
    duplicateData.value = data;
    isDuplicateModalOpen.value = true;
  };

  const closeDuplicateModal = () => {
    isDuplicateModalOpen.value = false;
    duplicateData.value = null;
  };

  const handleCreated = (form: CreateCollectionForm) => {
    if (duplicateData.value?.onCreated) {
      duplicateData.value.onCreated(form);
    }
    closeDuplicateModal();
  };

  return {
    isDuplicateModalOpen,
    duplicateData,
    openDuplicateModal,
    closeDuplicateModal,
    handleCreated,
  };
});
