<template>
  <div ref="scrollAreaRef" class="scroll-area">
    <slot :observer="observer" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const scrollAreaRef = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const scrolledToView = new Event('scrolledToView');

const emit = defineEmits<{(e: 'scrolledToView', id: string): void;
}>();

const handleIntersectCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio >= 0.5) {
      entry.target.dispatchEvent(scrolledToView);
      emit('scrolledToView', entry.target.id);
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
