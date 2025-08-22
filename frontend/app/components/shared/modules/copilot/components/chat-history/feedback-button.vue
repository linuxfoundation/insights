<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div 
    class="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center"
    :class="{
      'bg-positive-100': isSelected && type === 'good',
      'bg-negative-100': isSelected && type === 'bad',
      'hover:bg-neutral-50': !isSelected,
      'bg-transparent': !isSelected
    }"
  >
    <lfx-icon
      :name="type === 'good' ? 'thumbs-up' : 'thumbs-down'"
      :size="15"
      :type="isSelected ? 'solid' : 'light'"
      :class="{
        'text-positive-600': isSelected && type === 'good',
        'text-negative-500': isSelected && type === 'bad',
        'text-neutral-900': !isSelected,
        'hover:text-positive-600': isSelected && type === 'good' && !isSelected,
        'hover:text-negative-500': isSelected && type === 'bad' && !isSelected,
        'hover:text-neutral-900': !isSelected && !isSelected
      }"
    />
  </div>
</template>
<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  type: 'good' | 'bad';
  isSelected: boolean;
}>()

</script>

<script lang="ts">
export default {
  name: 'LfxChatResult'
}
</script>