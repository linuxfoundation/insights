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
      :key="`${item.name}-${index}`"
      class="lfx-table-row !gap-1 sm:!gap-4"
    >
      <div class="flex flex-row gap-3 items-center basis-1/2 overflow-hidden">
        <lfx-avatar
          :src="item.avatar"
          type="member"
          class="min-w-8"
          :aria-label="item.avatar && item.name"
        />
        <div class="flex flex-col items-start sm:flex-row gap-2 overflow-hidden w-full">
          <div class="overflow-hidden whitespace-nowrap text-ellipsis no-underline w-full">
            {{ item.name }}
          </div>

          <lfx-tag
            v-if="item.roles?.includes('maintainer')"
            size="small"
          >
            Maintainer
          </lfx-tag>
        </div>
      </div>
      <div class="basis-1/4 text-right">
        {{ formatNumberShort(item.activityCount) }}
      </div>
      <div class="basis-1/4 text-right">{{ (item.percentage || 0) > 0 ? item.percentage : '<1' }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxTag from '~/components/uikit/tag/tag.vue';
import type { CodeReviewEngagementPRParticipantsItem } from '~~/types/development/responses.types';

const props = defineProps<{
  metric: string;
  codeReviewItem: CodeReviewEngagementPRParticipantsItem[];
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
  name: 'LfxCodeReviewTable',
};
</script>
