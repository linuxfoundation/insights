<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="bg-white py-2 px-3 rounded-md flex items-center justify-between text-sm leading-5 font-medium cursor-pointer hover:bg-neutral-50 transition-colors"
    @click="$emit('toggle')"
  >
    <slot>
      <span class="text-neutral-900">{{ label }}</span>
    </slot>
    <lfx-icon
      v-if="selected"
      name="check"
      :size="16"
      class="text-brand-500"
    />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

withDefaults(
  defineProps<{
    label?: string;
    selected: boolean;
  }>(),
  {
    label: 'All',
  },
);

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityFilterSelectAll',
};
</script>
