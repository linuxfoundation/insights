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
      type="outline"
      class="!border-neutral-400 !px-1.5 !py-0.5"
    >
      <span class="text-nowrap !text-neutral-400 font-semibold">
        {{ props.maturity }}
      </span>
    </lfx-tag>
    <template #content>
      <div class="text-xs font-semibold bg-neutral-900 py-1.5 px-2 rounded-md">
        <div class="text-white">Maturity level as defined by the Linux Foundation</div>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';

const props = defineProps<{
  maturity: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxMaturityTag',
};
</script>
