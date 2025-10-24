<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="c-accordion">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

provide('selectedItem', model);
</script>

<script lang="ts">
export default {
  name: 'LfxAccordion',
};
</script>
