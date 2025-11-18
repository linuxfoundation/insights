<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-8 py-10">
    <lfx-card
      v-for="mention in mentions"
      :key="mention.sourceId"
      class="border border-neutral-100 rounded-xl overflow-hidden"
    >
      <div class="flex flex-col gap-5">
        <!-- Header Section -->
        <lfx-community-card-header :mention="mention" />

        <!-- Content Section -->
        <div class="flex gap-8 items-start px-6 py-3">
          <div class="flex gap-3 items-start flex-1 min-w-0">
            <!-- Sentiment Icon -->
            <div class="flex flex-col items-center gap-2 py-1 w-5 shrink-0">
              <lfx-icon
                :name="getSentimentIcon(mention.sentimentLabel)"
                type="regular"
                :size="16"
                :class="getSentimentColor(mention.sentimentLabel)"
              />
              <div
                class="flex-1 w-0.5 min-h-[20px]"
                :class="getSentimentBarColor(mention.sentimentLabel)"
              />
            </div>

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
        </div>

        <!-- Relevance Comment Section -->
        <div class="flex gap-2 items-start px-6 py-4 bg-accent-50 text-neutral-500">
          <lfx-icon
            name="info-circle"
            type="light"
            :size="16"
            class="shrink-0"
          />
          <p class="text-xs leading-4 flex-1">
            {{ mention.relevanceComment }}
          </p>
        </div>
      </div>
    </lfx-card>
  </div>
</template>

<script setup lang="ts">
import LfxCommunityCardHeader from './card-header.vue';
import type { CommunityMentions } from '~~/types/community/community';
import { platforms } from '~/config/platforms';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  mentions: CommunityMentions[];
}>();

const getSentimentIcon = (sentiment: string) => {
  const sentimentLower = sentiment.toLowerCase();
  if (sentimentLower === 'positive') {
    return 'face-smile';
  }
  if (sentimentLower === 'negative') {
    return 'face-frown-slight';
  }
  return 'face-meh';
};

const getSentimentColor = (sentiment: string) => {
  const sentimentLower = sentiment.toLowerCase();
  if (sentimentLower === 'positive') {
    return 'text-success-600';
  }
  if (sentimentLower === 'negative') {
    return 'text-danger-600';
  }
  return 'text-neutral-500';
};

const getSentimentBarColor = (sentiment: string) => {
  const sentimentLower = sentiment.toLowerCase();
  if (sentimentLower === 'positive') {
    return 'bg-success-500';
  }
  if (sentimentLower === 'negative') {
    return 'bg-danger-500';
  }
  return 'bg-neutral-400';
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityResultsArea',
};
</script>
