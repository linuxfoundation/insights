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
          <div class="relative w-5 shrink-0 overflow-hidden">
            <lfx-community-sentiment-icon :sentiment-label="mention.sentimentLabel" />
          </div>

          <!-- Text Content -->
          <div class="flex-1 min-w-0 overflow-hidden">
            <p
              v-if="mention.title"
              class="text-base font-semibold leading-6 text-black mb-3 whitespace-pre-wrap"
            >
              {{ mention.title }}
            </p>
            <p
              class="text-base leading-6 text-black whitespace-pre-wrap xl:break-normal break-all md:block hidden"
              v-html="truncateText(sanitize(mention.body), 300)"
            />
            <p
              class="text-base leading-6 text-black whitespace-pre-wrap md:hidden block"
              v-html="truncateText(sanitize(mention.body), 150)"
            />
          </div>
        </div>

        <!-- Image -->
        <img
          v-if="mention.imageUrl && imageIsValid"
          :src="mention.imageUrl"
          alt=""
          class="w-full lg:w-51 lg:h-25 h-29 object-cover rounded-lg shrink-0"
        />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import LfxCommunitySentimentIcon from './sentiment-icon.vue';
import type { CommunityMentions } from '~~/types/community/community';
import { useSanitize } from '~~/composables/useSanitize';

const props = defineProps<{
  mention: CommunityMentions;
}>();

const { sanitize } = useSanitize();

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const imageIsValid = ref(false);

const isValidUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }

    // Try to load the image
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  } catch {
    return false;
  }
};

// Check image validity when mention changes
watch(
  () => props.mention.imageUrl,
  async (newUrl) => {
    imageIsValid.value = await isValidUrl(newUrl);
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityCardContent',
};
</script>
