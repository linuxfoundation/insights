<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="block"
    :style="{ 'height': fixedHeight ? fixedHeight + 'px' : 'auto' }"
  />
  <div
    ref="maintainHeightRef"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
ref, onMounted, nextTick, watch
} from 'vue';

const fixedHeight = ref<number | null>(null);
const maintainHeightRef = ref<HTMLDivElement | null>(null);

const props = defineProps<{
  loaded?: boolean
}>();

const calculateHeight = async () => {
  await nextTick();
  // @Gasper, I've added this hack to fix the height calculation issue.
  // When you navigate from 1 collection to another, the height is not calculated correctly.
  // This is a hack to delay the height calculation to ensure the height is calculated correctly.
  // Feel free to remove this if you find a better solution.
  setTimeout(() => {
    if (maintainHeightRef.value) {
      const height = maintainHeightRef.value.offsetHeight;
      if (height > 0) {
        fixedHeight.value = height;
      }
    }
  }, 800);
};

onMounted(async () => {
  await calculateHeight();
});

watch(() => props.loaded, async () => {
  if (props.loaded) {
    await calculateHeight();
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxMaintainHeight'
};
</script>
