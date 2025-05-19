<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="(props.scrollTop || 0) > 0"
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
  loaded?: boolean,
  scrollTop?: number
}>();

const calculateHeight = async () => {
  await nextTick();

  if (maintainHeightRef.value) {
    const height = maintainHeightRef.value.offsetHeight;
    if (height > 0) {
      fixedHeight.value = height;
    }
  }
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
