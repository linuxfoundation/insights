<template>
  <div
    :id="props.id"
    ref="scrollViewRef"
    class="scroll-view"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  onMounted, onUnmounted, ref, watch
} from 'vue';
// import useScroll from '~/components/shared/utils/scroll';

const scrollViewRef = ref<HTMLElement | null>(null);
const props = defineProps<{
  id: string;
  observer: IntersectionObserver | null;
}>();

const emit = defineEmits<{(e: 'scrolledToView', id: string): void;
}>();

onMounted(() => {
  if (scrollViewRef.value) {
    scrollViewRef.value.addEventListener('scrolledToView', () => {
      emit('scrolledToView', props.id);
    });
  }
});

onUnmounted(() => {
  if (scrollViewRef.value) {
    scrollViewRef.value.removeEventListener('scrolledToView', () => { });

    if (props.observer) {
      props.observer.unobserve(scrollViewRef.value);
    }
  }
});

watch(props, (newVal) => {
  if (newVal.observer && scrollViewRef.value) {
    newVal.observer.observe(scrollViewRef.value);
  }
});
</script>
<script lang="ts">
export default {
  name: 'LfxScrollView'
};
</script>
