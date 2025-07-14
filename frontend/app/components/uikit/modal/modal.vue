<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <template v-if="isModalOpened">
    <teleport to="body">
      <div
        class="c-modal"
        @click="clickOutsideClose()"
      >
        <div 
          v-if="props.showCloseButton" 
          class="c-modal__content-wrapper"
          :style="{ 'max-width': props.width }"
        >
          <div
            class="c-modal__content"
            :class="props.contentClass"
            :style="{ 'max-width': props.width }"
            v-bind="$attrs"
            @click.stop
          >
            <slot :close="close" />
          </div>
          <lfx-icon-button
            class="absolute top-2 -right-10 z-100"
            size="small"
            icon="fa fa-xmark fa-light"
            @click="clickOutsideClose()"
          />
        </div>
        <div
          v-else
          class="c-modal__content"
          :class="props.contentClass"
          :style="{ 'max-width': props.width }"
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
import { computed, watch } from 'vue';
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";

const props = withDefaults(defineProps<{
  modelValue: boolean,
  contentClass?: string,
  width?: string,
  showCloseButton?: boolean,
  closeFunction?:() => boolean,
}>(), {
  width: '37.5rem',
  closeFunction: () => true
});

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void }>();

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

watch(() => isModalOpened.value, (show: boolean) => {
  if (!show) {
    window.removeEventListener('keyup', onEscapeKeyUp);
  } else {
    window.addEventListener('keyup', onEscapeKeyUp);
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxModal',
};
</script>
