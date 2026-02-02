<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-3">
    <!-- X (Twitter) -->
    <button
      type="button"
      class="size-9 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
      @click="shareToX"
    >
      <lfx-icon
        name="x-twitter"
        type="brands"
        :size="18"
        class="text-white"
      />
    </button>

    <!-- LinkedIn -->
    <button
      type="button"
      class="size-9 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-opacity"
      @click="shareToLinkedIn"
    >
      <lfx-icon
        name="linkedin-in"
        type="brands"
        :size="18"
        class="text-white"
      />
    </button>

    <!-- Reddit -->
    <button
      type="button"
      class="size-9 rounded-full bg-[#FF4500] flex items-center justify-center hover:opacity-80 transition-opacity"
      @click="shareToReddit"
    >
      <lfx-icon
        name="reddit-alien"
        type="brands"
        :size="18"
        class="text-white"
      />
    </button>

    <!-- Email -->
    <button
      type="button"
      class="size-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
      @click="shareViaEmail"
    >
      <lfx-icon
        name="envelope"
        :size="20"
        class="text-neutral-900"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../config/badge.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const { project } = storeToRefs(useProjectStore());

const shareUrl = computed(() => {
  const url = new URL(window.location.href);
  url.searchParams.set('badge', props.badge.config.leaderboardKey);
  return url.toString();
});

const formattedDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const shareTitle = computed(() => {
  return `As of ${formattedDate.value}, ${project.value?.name} is in the top ${props.badge.percentile}% of open source projects for ${props.badge.config.description.toLowerCase()} over the last 12 months.`;
});

const shareToX = () => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle.value)}&url=${encodeURIComponent(shareUrl.value)}`;
  window.open(url, '_blank', 'width=550,height=420');
};

const shareToLinkedIn = () => {
  const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareTitle.value)}`;
  window.open(url, '_blank', 'width=550,height=420');
};

const redditTitle = computed(() => {
  return `LFX Insights | ${project.value?.name} is in the top ${props.badge.percentile}% of open source projects for ${props.badge.config.description.toLowerCase()} in the last 12 months.`;
});

const shareToReddit = () => {
  const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(redditTitle.value)}`;
  window.open(url, '_blank', 'width=550,height=420');
};

const emailSubject = computed(() => {
  return `Check this out: ${project.value?.name} - Achievement | LFX Insights`;
});

const emailBody = computed(() => {
  return `${shareTitle.value}\n\n${shareUrl.value}`;
});

const shareViaEmail = () => {
  window.open(
    `mailto:?subject=${encodeURIComponent(emailSubject.value)}&body=${encodeURIComponent(emailBody.value)}`,
    '_blank',
  );
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesShareSocials',
};
</script>
