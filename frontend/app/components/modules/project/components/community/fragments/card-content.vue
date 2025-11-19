<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-8 items-start px-6 py-3">
    <slot>
      <div class="flex gap-3 items-stretch flex-1 min-w-0">
        <!-- Sentiment Icon -->
        <lfx-community-sentiment-icon :sentiment-label="mention.sentimentLabel" />

        <!-- Text Content -->
        <div class="flex-1 min-w-0">
          <p
            v-if="mention.title"
            class="text-base font-semibold leading-6 text-black mb-3 whitespace-pre-wrap"
          >
            {{ mention.title }}
          </p>
          <p class="text-base leading-6 text-black whitespace-pre-wrap">
            {{ truncateText(mention.body, 300) }}
          </p>
        </div>
      </div>

      <!-- Image -->
      <img
        v-if="mention.imageUrl"
        :src="mention.imageUrl"
        alt=""
        class="w-[200px] h-[100px] object-cover rounded-lg shrink-0"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import LfxCommunitySentimentIcon from './sentiment-icon.vue';
import type { CommunityMentions } from '~~/types/community/community';

defineProps<{
  mention: CommunityMentions;
}>();

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityCardContent',
};
</script>
