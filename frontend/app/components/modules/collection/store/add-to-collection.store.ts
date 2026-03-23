// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface AddToCollectionProject {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface AddToCollectionData {
  project: AddToCollectionProject;
  onAdded?: () => void;
}

export const useAddToCollectionStore = defineStore('addToCollection', () => {
  const isModalOpen = ref(false);
  const modalData = ref<AddToCollectionData | null>(null);

  const openModal = (data: AddToCollectionData) => {
    modalData.value = data;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const handleAdded = () => {
    if (modalData.value?.onAdded) {
      modalData.value.onAdded();
    }
    closeModal();
  };

  return {
    isModalOpen,
    modalData,
    openModal,
    closeModal,
    handleAdded,
  };
});
