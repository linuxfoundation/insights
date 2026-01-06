<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <template v-if="isModalOpened">
    <teleport to="body">
      <div
        class="c-modal"
        :class="modalClass"
        @click="clickOutsideClose()"
      >
        <div
          class="c-modal__content"
          :class="props.contentClass"
          :style="{ 'max-width': props.width, 'max-height': props.height }"
          v-bind="$attrs"
          @click.stop
        >
          <slot :close="close" />
        </div>
      </div>
    </teleport>
  </template>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    type?: 'default' | 'floating' | 'cover' | 'mobile-cover';
    contentClass?: string;
    width?: string;
    height?: string;
    closeFunction?: () => boolean;
  }>(),
  {
    type: 'default',
    width: '37.5rem',
    height: 'auto',
    closeFunction: () => true,
    contentClass: undefined,
  },
);

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const isModalOpened = computed<boolean>({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

const close = () => {
  emit('update:modelValue', false);
};

const clickOutsideClose = () => {
  const canClose = props.closeFunction();
  if (canClose) {
    close();
  }
};

const onEscapeKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    clickOutsideClose();
  }
};

const modalClass = computed(() => {
  return {
    'c-modal--floating': props.type === 'floating',
    'c-modal--cover': props.type === 'cover',
    'c-modal--mobile-cover': props.type === 'mobile-cover',
  };
});

watch(
  () => props.modelValue,
  (show: boolean) => {
    if (!document || !window) return;
    if (!show) {
      window.removeEventListener('keyup', onEscapeKeyUp);
      document.documentElement.style.overflow = '';
    } else {
      window.addEventListener('keyup', onEscapeKeyUp);
      document.documentElement.style.overflow = 'hidden';
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  window.removeEventListener('keyup', onEscapeKeyUp);
  document.documentElement.style.overflow = '';
});
</script>

<script lang="ts">
export default {
  name: 'LfxModal',
};
</script>
