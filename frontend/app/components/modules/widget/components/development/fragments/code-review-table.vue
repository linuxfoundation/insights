<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="lfx-table">
    <div class="lfx-table-header">
      <div class="basis-2/4">Contributor</div>
      <div class="basis-1/4 text-right">{{ activityColumnHeader }}</div>
      <div class="basis-1/4 text-right">% of total</div>
    </div>

    <div
      v-for="(item, index) in props.codeReviewItem"
      :key="index"
      class="lfx-table-row"
    >
      <div class="flex flex-row gap-3 items-center basis-2/4">
        <lfx-avatar
          :src="item.avatar"
          type="member"
        />
        <div>{{ item.name }}</div>
      </div>
      <div class="basis-1/4 text-right">
        {{ formatNumberShort(item.activityCount) }}
      </div>
      <div class="basis-1/4 text-right">
        {{ item.percentage }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CodeReviewItem } from '../types/code-review-engagement.types';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { formatNumberShort } from '~/components/shared/utils/formatter';

const props = defineProps<{
  metric: string;
  codeReviewItem: CodeReviewItem[];
}>();

const activityColumnHeader = computed(() => {
  switch (props.metric) {
    case 'review-comments':
      return 'Review comment activities';
    case 'code-reviews':
      return 'Code review activities';
    default:
      return 'Pull request activities';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxCodeReviewTable'
};
</script>
