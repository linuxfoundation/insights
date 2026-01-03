<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <i
    :class="`fa-${props.name} fa-${props.type}`"
    :style="sizeStyle"
    class="c-icon"
    :role="props.ariaLabel ? 'img' : undefined"
    :aria-label="props.ariaLabel"
    :aria-hidden="props.ariaLabel ? undefined : 'true'"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { IconType } from './types/icon.types';

const props = withDefaults(
  defineProps<{
    name: string;
    type?: IconType;
    size?: number;
    ariaLabel?: string;
  }>(),
  {
    type: 'light',
    size: 16,
  },
);

const sizeStyle = computed(() => ({
  '--lfx-icon-size': `${props.size / 16}rem`,
}));
</script>

<script lang="ts">
export default {
  name: 'LfxIcon',
};
</script>
