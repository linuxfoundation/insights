<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-8">
    <div
      v-for="mention in mentions"
      :key="mention.sourceId"
    >
      <component
        :is="getCommunityConfig(mention.source)?.dataDisplay"
        :mention="mention"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { communityConfigs } from '../config';
import type { CommunityMentions } from '~~/types/community/community';

defineProps<{
  mentions: CommunityMentions[];
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
