<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="block"
    :style="{ 'height': fixedHeight + 'px' }"
  />
  <div
    ref="maintainHeightRef"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue';

const fixedHeight = ref<number | null>(null);
const maintainHeightRef = ref<HTMLDivElement | null>(null);

const props = defineProps<{
  loaded?: boolean
}>();

const calculateHeight = () => {
  if (maintainHeightRef.value) {
    fixedHeight.value = maintainHeightRef.value.offsetHeight;
  }
}

onMounted(async () => {
  await nextTick();
  calculateHeight();
});

watch(props.loaded, () => {
    calculateHeight();
});
</script>

<script lang="ts">
export default {
  name: 'LfxMaintainHeight'
};
</script>
