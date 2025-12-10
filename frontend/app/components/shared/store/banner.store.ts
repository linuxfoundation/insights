// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { bannerConfig } from '~/config/banner.config';

export const useBannerStore = defineStore('banner', () => {
  const isBannerVisible = ref(false);
  const hideBanner = () => {
    localStorage.setItem(`${bannerConfig.key}-flagged`, 'true');
    isBannerVisible.value = false;
  };

  const checkBannerVisibility = () => {
    const bannerFlagged = localStorage.getItem(`${bannerConfig.key}-flagged`) === 'true';
    return new Date() < bannerConfig.validUntil && !bannerFlagged && bannerConfig.enabled;
  };

  const headerTopClass = computed(() =>
    isBannerVisible.value ? 'top-28 sm:top-21 lg:top-24' : 'top-14 lg:top-17',
  );

  return {
    isBannerVisible,
    hideBanner,
    checkBannerVisibility,
    headerTopClass,
  };
});
