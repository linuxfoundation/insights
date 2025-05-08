<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    :placement="props.placement"
    :disabled="props.disabled"
    trigger-event="hover"
  >
    <slot />

    <template #content>
      <div
        class="c-tooltip"
        :class="`c-tooltip--${props.placement}`"
      >
        <slot name="content">
          {{ props.content }}
        </slot>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import type {Placement} from "@popperjs/core";
import LfxPopover from "~/components/uikit/popover/popover.vue";

const props = withDefaults(
  defineProps<{
    placement?: Placement,
    content?: string;
    disabled?: boolean;
  }>(),
  {
    placement: 'top',
    content: '',
    disabled: false,
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxTooltip'
};
</script>
