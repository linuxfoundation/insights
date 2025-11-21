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

    <lfx-button
      v-if="!isLoading && hasNextPage"
      type="transparent"
      class="w-full justify-center"
      button-style="pill"
      @click="emit('fetchNextPage')"
    >
      View more
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import { communityConfigs } from '../config';
import type { CommunityMentions } from '~~/types/community/community';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxButton from '~/components/uikit/button/button.vue';

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
