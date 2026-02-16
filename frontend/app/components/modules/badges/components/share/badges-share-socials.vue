<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-3">
    <!-- X (Twitter) -->
    <lfx-tooltip content="X/Twitter">
      <button
        type="button"
        aria-label="Share on X/Twitter"
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
    </lfx-tooltip>

    <!-- LinkedIn -->
    <lfx-tooltip content="LinkedIn">
      <button
        type="button"
        aria-label="Share on LinkedIn"
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
    </lfx-tooltip>

    <!-- Reddit -->
    <lfx-tooltip content="Reddit">
      <button
        type="button"
        aria-label="Share on Reddit"
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
    </lfx-tooltip>

    <!-- Email -->
    <lfx-tooltip content="Email">
      <button
        type="button"
        aria-label="Share via email"
        class="size-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
        @click="shareViaEmail"
      >
        <lfx-icon
          name="envelope"
          :size="20"
          class="text-neutral-900"
        />
      </button>
    </lfx-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../../types/badge.types';
import { tierConfigs } from '../../config/tiers.config';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const { project } = storeToRefs(useProjectStore());

const tierConfig = computed(() => tierConfigs[props.badge.tier]);

const shareUrl = computed(() => {
  if (!import.meta.client) return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('badge', props.badge.config.leaderboardKey);
  return url.toString();
});

const formattedDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const shareTitle = computed(() => {
  return `As of ${formattedDate.value}, ${project.value?.name} is in the top ${tierConfig.value.max}% of open source projects for ${props.badge.config.description.toLowerCase()}`;
});

const shareToX = () => {
  if (!import.meta.client) return;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle.value)}&url=${encodeURIComponent(shareUrl.value)}`;
  window.open(url, '_blank', 'width=550,height=420');
};

const shareToLinkedIn = () => {
  if (!import.meta.client) return;
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`;
  window.open(url, '_blank', 'width=550,height=420');
};

const redditTitle = computed(() => {
  return `LFX Insights | ${project.value?.name} is in the top ${tierConfig.value.max}% of open source projects for ${props.badge.config.description.toLowerCase()}`;
});

const shareToReddit = () => {
  if (!import.meta.client) return;
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
  if (!import.meta.client) return;
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
