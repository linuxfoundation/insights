<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <pv-select-button
    v-model="value"
    :options="props.tabs"
    option-label="label"
    data-key="value"
    option-value="value"
    :allow-empty="false"
    :class="`tabs-width-${props.widthType}`"
  >
    <template #option="slotProps">
      <slot
        name="slotItem"
        :option="slotProps.option"
      >
        <i
          v-if="slotProps.option.icon"
          :class="slotProps.option.icon"
        />
        <template v-else>{{ slotProps.option.label }}</template>
      </slot>
      <!-- <span class="text-neutral-500">{{ slotProps.option.label }}123</span> -->
      <!-- <i :class="slotProps.option.icon"></i> -->
    </template>
  </pv-select-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TabsProps, TabsEmits } from './types/tab.types';

const props = withDefaults(defineProps<TabsProps>(), {
  widthType: 'full',
});
const emit = defineEmits<TabsEmits>();

const value = computed({
  get() {
    return props.modelValue || '';
  },
  set(value: string) {
    emit('update:modelValue', value);
  },
});
</script>

<script lang="ts">
export default {
  name: 'LfxTabs',
};
</script>
