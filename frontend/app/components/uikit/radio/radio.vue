<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <label
    class="c-radio"
    :class="[`c-radio--${props.size}`, { 'c-radio--disabled': props.disabled }]"
  >
    <input
      v-model="selected"
      type="radio"
      :name="props.name"
      :value="props.value"
      :disabled="props.disabled"
      class="c-radio__input"
    />
    <span class="c-radio__indicator">
      <span class="c-radio__dot" />
    </span>
    <span
      v-if="$slots.default"
      class="c-radio__label"
    >
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RadioSize } from './types/radio.types';

const props = withDefaults(
  defineProps<{
    modelValue: string | number | boolean;
    value: string | number | boolean;
    name?: string;
    size?: RadioSize;
    disabled?: boolean;
  }>(),
  {
    name: undefined,
    size: 'default',
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void;
}>();

const selected = computed({
  get() {
    return props.modelValue;
  },
  set(val: string | number | boolean) {
    emit('update:modelValue', val);
  },
});
</script>

<script lang="ts">
export default {
  name: 'LfxRadio',
};
</script>
