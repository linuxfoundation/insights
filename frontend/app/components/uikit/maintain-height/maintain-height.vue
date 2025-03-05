<template>
  <div
    ref="maintainHeightRef"
    :style="{ 'min-height': fixedHeight + 'px' }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';

const fixedHeight = ref<number | null>(null);
const maintainHeightRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (maintainHeightRef.value) {
    fixedHeight.value = maintainHeightRef.value.offsetHeight;
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxMaintainHeight'
};
</script>
