<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="md:mt-16 mt-10">
    <div class="flex flex-col gap-5 items-center text-neutral-900">
      <div class="pb-5">
        <lfx-onboarding-link show-message />
      </div>
      <h1 class="lg:text-4xl text-heading-1 font-secondary font-light text-center w-">
        Discover the world's <br />
        most critical open source projects
      </h1>
      <p class="text-sm">
        LFX Insights helps developers and their organizations make smarter decisions about the open
        source projects they depend on
      </p>

      <div class="w-full flex justify-center mt-5 pb-10">
        <div
          class="w-full sm:max-w-120 overflow-hidden bg-neutral-50 h-[45px] border border-neutral-200 rounded-full flex items-center gap-2 px-5 cursor-pointer"
          @click="isModalOpen = true"
        >
          <lfx-icon
            name="search"
            class="text-neutral-400 font-normal"
            :size="20"
          />
          <p class="text-base text-neutral-400 truncate">Search projects, repositories...</p>
          <div class="flex-grow" />
        </div>
      </div>
    </div>
  </section>

  <lfx-search-modal
    v-if="isModalOpen"
    v-model="isModalOpen"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSearchModal from '~/components/shared/layout/search/search-modal.vue';
import LfxOnboardingLink from '~/components/shared/components/onboarding-link.vue';

const isModalOpen = ref(false);
</script>

<script lang="ts">
export default {
  name: 'LfxExploreHeader',
};
</script>
