<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <label
    class="c-checkbox"
  >
    <input
      v-model="checked"
      type="checkbox"
      :value="props.value"
      :disabled="props.disabled"
    >
    <lfx-icon
      v-if="checked"
      name="check"
      type="regular"
      :size="10"
      class="text-white"
    />
    <span class="flex flex-col">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = withDefaults(defineProps<{
  modelValue: boolean,
  value?: string | boolean,
  disabled?: boolean,
}>(), {
  value: true,
  disabled: false,
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
  name: 'LfxCheckbox',
};
</script>
