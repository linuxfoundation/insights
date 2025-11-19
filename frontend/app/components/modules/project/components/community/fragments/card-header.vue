<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-wrap items-center gap-1 px-6 pt-6">
    <div class="flex items-center gap-3">
      <img
        v-if="platformConfig?.image"
        :src="platformConfig?.image"
        :alt="platformConfig?.label"
        class="w-5 h-5 object-contain"
      />
      <p class="text-xs font-medium text-black">Mention of</p>
    </div>
    <lfx-tag
      variation="info"
      size="small"
      type="solid"
      class="!bg-accent-100 !text-accent-500"
    >
      {{ mention.keyword }}
    </lfx-tag>
    <p class="text-xs font-medium text-black">in</p>
    <!-- Source Display -->
    <div class="flex flex-col">
      <slot name="source-display">
        <p
          class="text-xs font-medium text-black"
          :class="{ underline: mention.url }"
        >
          {{ getSourceDisplay }}
        </p>
      </slot>
    </div>
    <p class="text-xs font-medium text-neutral-400">・ {{ formatTimestamp }} by</p>
    <div class="flex flex-col">
      <p
        class="text-xs font-medium text-neutral-500"
        :class="{ underline: mention.authorProfileLink }"
      >
        {{ mention.author }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DateTime } from 'luxon';
import { communityConfigs } from '../config';
import type { CommunityMentions } from '~~/types/community/community';

const props = defineProps<{
  mention: CommunityMentions;
}>();

const platformConfig = computed(() => {
  return communityConfigs[props.mention.source];
});

const getSourceDisplay = computed(() => {
  return platformConfig.value?.label || props.mention.source;
});

const formatTimestamp = computed(() => {
  const dt = DateTime.fromSQL(props.mention.timestamp);
  const now = DateTime.now();
  const diff = now.diff(dt, ['years', 'months', 'weeks', 'days', 'hours', 'minutes']).toObject();

  if (diff.years && diff.years >= 1) {
    return `${Math.floor(diff.years)}y ago`;
  }
  if (diff.months && diff.months >= 1) {
    return `${Math.floor(diff.months)}mo ago`;
  }
  if (diff.weeks && diff.weeks >= 1) {
    return `${Math.floor(diff.weeks)}w ago`;
  }
  if (diff.days && diff.days >= 1) {
    return `${Math.floor(diff.days)}d ago`;
  }
  if (diff.hours && diff.hours >= 1) {
    return `${Math.floor(diff.hours)}h ago`;
  }
  return `${Math.floor(diff.minutes || 0)}m ago`;
});
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityCardHeader',
};
</script>
