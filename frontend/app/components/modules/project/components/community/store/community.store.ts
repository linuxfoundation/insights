// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommunityStore = defineStore('community', () => {
  const selectedPlatforms = ref<string[]>([]);
  const selectedKeywords = ref<string[]>([]);
  const selectedSentiments = ref<string[]>([]);
  const selectedLanguages = ref<string[]>([]);
  const isCommunityFilterOpen = ref(false);

  const openCommunityFilterModal = () => {
    isCommunityFilterOpen.value = true;
  };

  return {
    selectedPlatforms,
    selectedKeywords,
    selectedSentiments,
    selectedLanguages,
    isCommunityFilterOpen,
    openCommunityFilterModal,
  };
});
