<template>
  <div
    class="c-tag"
    :class="[
      `c-tag--${props.style}`,
      `c-tag--${props.size}`,
      `c-tag--${props.type}`
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { TagType, TagSize, TagStyle } from './types/tag.types';

const props = withDefaults(
  defineProps<{
    style?: TagStyle;
    size?: TagSize;
    type?: TagType;
  }>(),
  {
    style: 'default',
    size: 'medium',
    type: 'solid',
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxTag'
};
</script>
