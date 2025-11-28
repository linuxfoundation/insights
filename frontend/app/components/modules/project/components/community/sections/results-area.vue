<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col md:gap-8 gap-5">
    <div
      v-for="mention in mentions"
      :key="mention.sourceId"
    >
      <component
        :is="getCommunityConfig(mention.source)?.dataDisplay"
        :mention="mention"
      />
    </div>
    <template v-if="isLoading || isPageLoading">
      <lfx-skeleton
        v-for="n in 5"
        :key="n"
        class="!h-30 w-full rounded-xl"
      />
    </template>

    <div
      v-if="mentions.length === 0 && !isLoading && !isPageLoading"
      class="flex flex-col items-center md:py-20 py-10"
    >
      <lfx-icon
        name="eyes"
        :size="80"
        class="text-neutral-200"
      />
      <h3 class="text-center pt-5 md:text-xl text-base font-secondary font-bold mb-2">No mentions found</h3>
      <p class="text-xs text-neutral-500">Try adjusting your filters to find what you’re looking for.</p>
    </div>

    <lfx-button
      v-if="!isLoading && hasNextPage && mentions.length > 0"
      type="transparent"
      class="w-full justify-center"
      button-style="pill"
      @click="emit('fetchNextPage')"
    >
      View more
    </lfx-button>

    <div class="text-xs text-neutral-400 md:hidden block text-center">
      Community Voice data powered by
      <a
        :href="links.octolens"
        target="_blank"
        rel="noopener noreferrer"
        class="underline"
      >
        Octolens
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { communityConfigs } from '../config';
import type { CommunityMentions } from '~~/types/community/community';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { links } from '~/config/links';

defineProps<{
  mentions: CommunityMentions[];
  isLoading: boolean;
  isPageLoading: boolean;
  hasNextPage: boolean;
}>();

const emit = defineEmits<{
  (e: 'fetchNextPage'): void;
}>();

const getCommunityConfig = (source: string) => {
  return communityConfigs[source];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityResultsArea',
};
</script>
