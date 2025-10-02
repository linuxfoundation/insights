<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <label
    class="c-toggle"
    :class="[
      `c-toggle--${props.size}`,
      { 'c-toggle--disabled': props.disabled }
    ]"
  >
    <input
      v-model="checked"
      type="checkbox"
      :disabled="props.disabled"
      class="c-toggle__input"
    >
    <span class="c-toggle__slider">
      <span class="c-toggle__thumb" />
    </span>
    <span
      v-if="$slots.default"
      class="c-toggle__label"
    >
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import type { ToggleSize } from './types/toggle.types';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  size?: ToggleSize;
  disabled?: boolean;
}>(), {
  size: 'medium',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const checked = computed<boolean>({
  get() {
    return props.modelValue;
  },
  set(val: boolean) {
    emit('update:modelValue', val);
  },
});
</script>

<script lang="ts">
export default {
  name: 'LfxToggle',
};
</script>