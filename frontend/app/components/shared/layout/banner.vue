<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="isBannerVisible"
    class="sm:flex-row flex-col block bg-brand-800 text-white py-2 px-5 flex items-center sm:justify-center justify-start gap-3 relative"
  >
    <span class="sm:!text-xs text-2xs sm:leading-4 leading-3.5">
      {{ bannerConfig.text }}
    </span>
    <a
      :href="bannerConfig.link"
      class="font-bold hover:underline no-underline whitespace-nowrap sm:!text-xs text-2xs sm:leading-4 leading-3.5"
      target="_blank"
      rel="noopener noreferrer"
      >{{ bannerConfig.linkText }}</a
    >

    <button
      type="button"
      class="text-white absolute top-1/2 -translate-y-1/2 right-2"
      aria-label="Close banner"
      @click="flagBanner"
    >
      <lfx-icon
        :size="14"
        name="close"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { bannerConfig } from '~/config/banner.config';
import { useBannerStore } from '~/components/shared/store/banner.store';

const bannerStore = useBannerStore();
const { isBannerVisible } = storeToRefs(bannerStore);
const { hideBanner, checkBannerVisibility } = bannerStore;

const flagBanner = () => {
  hideBanner();
};

onMounted(() => {
  isBannerVisible.value = checkBannerVisibility();
});
</script>

<script lang="ts">
export default {
  name: 'LfxBanner',
};
</script>
