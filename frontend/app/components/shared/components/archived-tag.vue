<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    placement="top"
    trigger-event="hover"
  >
    <lfx-tag size="small">
      <lfx-icon
        v-if="archived"
        name="archive"
        :size="12"
      />
      <span class="text-nowrap">{{ label }}</span>
    </lfx-tag>
    <template #content>
      <div class="text-xs w-78 text-center flex flex-col gap-2 bg-neutral-900 py-1.5 px-2 rounded-md">
        <div class="text-white">
          {{
            archived
              ? 'Archived repositories are excluded from Health Score and Security & Best practices'
              : 'Repositories excluded from Health Score and Security & Best practices'
          }}
        </div>
        <div class="text-neutral-400">
          You can still access historical data of Contributors, Popularity, or Development metrics
        </div>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  archived: boolean;
  label: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxArchivedTag',
};
</script>
