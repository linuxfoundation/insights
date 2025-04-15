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

onMounted(async () => {
  await nextTick();
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
