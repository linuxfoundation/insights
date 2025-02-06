<template>
  <div v-if="isVisible" :class="`p-chip p-chip-size-${props.size} p-chip-type-${props.type}`">
    <slot />
    <i v-if="props.removable" class="p-chip-remove-icon fa-solid fa-circle-xmark" @click="isVisible = false" />
  </div>
</template>

<script setup lang="ts">
import type { ChipSize, ChipType } from './types/chip.types';

const props = withDefaults(
  defineProps<{
    size: ChipSize;
    type: ChipType;
    removable?: boolean;
  }>(),
  {
    type: 'default',
    size: 'default',
    removable: false
  }
);
const isVisible = ref(true);
</script>

<script lang="ts">
export default {
  name: 'LfxChip'
};
</script>
