<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-dropdown__selector"
    :class="[
      `c-dropdown__selector--${props.size}`,
      `c-dropdown__selector--${props.type}`,
    ]"
  >
    <slot />
    <slot name="append">
      <lfx-icon
        name="angle-down"
        :size="12"
        class="text-neutral-500"
      />
    </slot>
  </div>
</template>

<script lang="ts" setup>
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = withDefaults(defineProps<{
  size?: 'medium' | 'small';
  type?: 'transparent' | 'filled';
}>(), {
  size: 'medium',
  type: 'transparent',
});
</script>

<script lang="ts">
export default {
  name: 'LfxDropdownSelector',
};
</script>
