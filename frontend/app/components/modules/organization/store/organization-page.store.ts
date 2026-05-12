// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OrganizationProfile } from '~~/types/organization-page';

export const useOrganizationPageStore = defineStore('organization-page', () => {
  const organization = ref<OrganizationProfile | null>(null);
  const isOrganizationLoading = ref(false);

  return {
    organization,
    isOrganizationLoading,
  };
});
