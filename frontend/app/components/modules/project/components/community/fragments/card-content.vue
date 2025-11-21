<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="md:px-6 px-4 py-3">
    <slot>
      <div class="flex lg:flex-row flex-col flex-wrap items-start lg:gap-8 gap-4">
        <div class="flex gap-3 items-stretch flex-1 min-w-0">
          <!-- Sentiment Icon -->
          <lfx-community-sentiment-icon :sentiment-label="mention.sentimentLabel" />

          <!-- Text Content -->
          <div class="flex-1 min-w-0 overflow-hidden">
            <p
              v-if="mention.title"
              class="text-base font-semibold leading-6 text-black mb-3 whitespace-pre-wrap"
            >
              {{ mention.title }}
            </p>
            <p class="text-base leading-6 text-black whitespace-pre-wrap lg:break-normal break-all md:block hidden">
              {{ truncateText(mention.body, 300) }}
            </p>
            <p class="text-base leading-6 text-black whitespace-pre-wrap md:hidden block">
              {{ truncateText(mention.body, 150) }}
            </p>
          </div>
        </div>

        <!-- Image -->
        <img
          v-if="mention.imageUrl && isValidUrl(mention.imageUrl)"
          :src="mention.imageUrl"
          alt=""
          class="w-full lg:w-[200px] lg:h-[100px] h-[120px] object-cover rounded-lg shrink-0"
        />
      </div>
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

const isValidUrl = (url: string) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityCardContent',
};
</script>
