<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex md:flex-row flex-col flex-wrap md:items-center items-start md:gap-1 gap-2 md:px-6 px-4 pt-6">
    <div class="flex items-center gap-3 md:mb-0 mb-1">
      <img
        v-if="platformConfig?.image"
        :src="platformConfig?.image"
        :alt="platformConfig?.label"
        class="w-5 h-5 object-contain"
      />
      <p class="text-xs font-medium text-black md:block hidden">Mention of</p>
    </div>
    <div class="flex items-center gap-1">
      <lfx-tag
        variation="info"
        size="small"
        type="solid"
        class="!text-brand-500"
      >
        {{ mention.keyword }}
      </lfx-tag>
      <p class="text-xs font-medium text-black">in</p>

      <!-- Source Display -->
      <div class="flex flex-col">
        <slot name="source-display">
          <template v-if="mention.url">
            <a
              :href="mention.url"
              class="text-xs font-medium text-black hover:underline decoration-dashed"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ getSourceDisplay }}
            </a>
          </template>
          <template v-else>
            <span class="text-xs font-medium text-black">
              {{ getSourceDisplay }}
            </span>
          </template>
        </slot>
      </div>
    </div>
    <div class="flex items-center gap-1">
      <p class="text-xs font-medium text-neutral-400">
        <span class="hidden md:inline">・</span> {{ formatTimestamp }} by
      </p>
      <div class="flex flex-col">
        <template v-if="mention.authorProfileLink">
          <a
            :href="mention.authorProfileLink"
            class="text-xs font-medium text-neutral-400 underline decoration-dashed hover:text-neutral-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ mention.author }}
          </a>
        </template>
        <template v-else>
          <span class="text-xs font-medium text-neutral-400">
            {{ mention.author }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DateTime } from 'luxon';
import { communityConfigs } from '../config';
import type { CommunityMentions } from '~~/types/community/community';
import LfxTag from '~/components/uikit/tag/tag.vue';

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
