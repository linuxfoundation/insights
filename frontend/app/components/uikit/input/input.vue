<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <label
    class="c-input"
    :class="{
      'is-disabled': props.disabled,
      'is-invalid': props.invalid,
    }"
  >
    <div
      v-if="$slots['prefix']"
      class="c-input__prefix"
    >
      <slot name="prefix" />
    </div>
    <input
      v-model="value"
      :placeholder="props.placeholder"
      :type="props.type"
      :disabled="props.disabled"
      v-bind="$attrs"
      :tabindex="props.tabindex"
      class="!outline-none !shadow-none "
    >
    <div
      v-if="$slots.suffix"
      class="c-input__suffix"
    >
      <slot name="suffix" />
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string | number,
  placeholder?: string,
  disabled?: boolean,
  invalid?: boolean,
  type?: string,
  tabindex?: string,
}>(), {
  placeholder: '',
  disabled: false,
  invalid: false,
  type: 'text',
  tabindex: undefined,
});

const emit = defineEmits<{(e: 'update:modelValue', value: string | number): void}>();

const value = computed<string | number>({
  get() {
    return props.modelValue;
  },
  set(val: string | number) {
    emit('update:modelValue', val);
  },
});
</script>

<script lang="ts">
export default {
  name: 'LfxInput',
};
</script>
