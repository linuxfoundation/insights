<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <button
    v-if="canGoPrev"
    class="carousel-nav carousel-nav-prev"
    :disabled="!canGoPrev"
    aria-label="Previous"
    type="button"
    @click="goToPrev"
  >
    <lfx-icon
      name="chevron-left"
      :size="18"
    />
  </button>

  <button
    v-if="canGoNext"
    class="carousel-nav carousel-nav-next"
    :disabled="!canGoNext"
    aria-label="Next"
    type="button"
    @click="goToNext"
  >
    <lfx-icon
      name="chevron-right"
      :size="18"
    />
  </button>

</template>
<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  canGoPrev: boolean;
  canGoNext: boolean;
}>();

const emit = defineEmits<{(e: 'next' | 'previous'): void;
}>();

const goToPrev = () => {
  emit('previous');
};

const goToNext = () => {
  emit('next');
};
</script>

<script lang="ts">
export default {
  name: 'LfxCarouselNavigation',
}
</script>
