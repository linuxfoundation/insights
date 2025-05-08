<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    ref="scrollAreaRef"
    class="scroll-area"
  >
    <slot :observer="observer" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import useScroll from '~/components/shared/utils/scroll';

const { scrollTop } = useScroll();

const scrollAreaRef = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const scrolledToView = new Event('scrolledToView');

const emit = defineEmits<{(e: 'scrolledToView', id: string): void;
}>();

const handleIntersectCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio >= 0.5) {
      entry.target.dispatchEvent(scrolledToView);
      // prevent the trigger if the scroll is at the top of the page
      if (scrollTop.value === 0) {
        const scrollViews = document.querySelectorAll('.scroll-view');
        if (scrollViews.length > 0) {
          emit('scrolledToView', scrollViews[0]?.id || '');
        }
      } else {
        emit('scrolledToView', entry.target.id);
      }
    }
  });
};

onMounted(() => {
  const options = {
    root: null,
    rootMargin: '100px 0px 0px 0px',
    threshold: 0.5
  };

  observer.value = new IntersectionObserver(handleIntersectCallback, options);
});

onUnmounted(() => {
  observer.value?.disconnect();
});
</script>

<script lang="ts">
export default {
  name: 'LfxScrollArea'
};
</script>
