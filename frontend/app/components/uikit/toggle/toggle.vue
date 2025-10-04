<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <label
    class="c-toggle"
    :class="[{
      'is-disabled': props.disabled,
    }, `c-toggle--${props.size}`]"
  >
    <input
      v-model="checked"
      type="checkbox"
      :disabled="props.disabled"
    >
    <span class="c-toggle__switch">
      <span class="c-toggle__handle" />
    </span>
    <span
      class="c-toggle__label"
    >
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: boolean,
  disabled?: boolean,
  size?: 'default' | 'small',
}>(), {
  disabled: false,
  size: 'default',
});

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void}>();

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
