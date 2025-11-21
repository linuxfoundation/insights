<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="py-2 px-3 flex items-center gap-2.5 text-sm leading-5 cursor-pointer hover:bg-slate-50 transition-colors rounded-md"
    @click.stop="$emit('toggle')"
  >
    <lfx-checkbox :model-value="selected" />
    <slot :option="option">
      <span class="text-neutral-900">{{ option.label }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';

defineProps<{
  option: {
    label: string;
    [key: string]: string;
  };
  selected: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityFilterOption',
};
</script>
