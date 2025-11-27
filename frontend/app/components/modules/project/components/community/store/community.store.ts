// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCommunityStore = defineStore('community', () => {
  const selectedPlatforms = ref<string[]>([]);
  const selectedKeywords = ref<string[]>([]);
  const selectedSentiments = ref<string[]>([]);
  const selectedLanguages = ref<string[]>([]);
  const isCommunityFilterOpen = ref(false);

  const filterCount = computed(() => {
    return (
      selectedPlatforms.value.length +
      selectedKeywords.value.length +
      selectedSentiments.value.length +
      selectedLanguages.value.length
    );
  });

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
    filterCount,
  };
});
