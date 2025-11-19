<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-2 items-start px-6 py-4 bg-accent-50 text-neutral-500">
    <slot>
      <lfx-icon
        name="info-circle"
        type="light"
        :size="16"
        class="shrink-0"
      />
      <p class="text-xs leading-4 flex-1">
        {{ mention.relevanceComment }}
      </p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { CommunityMentions } from '~~/types/community/community';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  mention: CommunityMentions;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityCardFooter',
};
</script>
