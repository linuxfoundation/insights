<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    placement="top"
    trigger-event="hover"
  >
    <lfx-tag
      size="small"
      :type="props.type === 'repository' ? 'solid' : 'outline'"
      :class="props.type === 'repository' ? '' : '!border-neutral-400 !px-1.5 !py-0.5'"
    >
      <lfx-icon
        v-if="props.type === 'repository' && archived"
        name="archive"
        :size="12"
      />
      <span
        class="text-nowrap"
        :class="props.type === 'repository' ? '' : '!text-neutral-400 font-semibold'"
      >
        {{ label }}
      </span>
    </lfx-tag>
    <template #content>
      <div
        v-if="props.type === 'repository'"
        class="text-xs w-78 text-center flex flex-col gap-2 bg-neutral-900 py-1.5 px-2 rounded-md"
      >
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
      <div
        v-if="props.type === 'project'"
        class="text-xs font-semibold bg-neutral-900 py-1.5 px-2 rounded-md"
      >
        <div class="text-white">This project is retired and no longer maintained</div>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(
  defineProps<{
    archived: boolean;
    label: string;
    type?: 'repository' | 'project';
  }>(),
  {
    archived: false,
    label: '',
    type: 'repository',
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxArchivedTag',
};
</script>
