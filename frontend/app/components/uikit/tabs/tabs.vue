<template>
  <pv-select-button v-model="value" :options="options" option-label="label" data-key="value" option-value="value">
    <template #option="slotProps">
      <slot name="slotItem" :option="slotProps.option">
        <i v-if="slotProps.option.icon" :class="slotProps.option.icon" />
        <template v-else>{{ slotProps.option.label }}</template>
      </slot>
      <!-- <span class="text-neutral-500">{{ slotProps.option.label }}123</span> -->
      <!-- <i :class="slotProps.option.icon"></i> -->
    </template>
  </pv-select-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TabsProps, TabsEmits } from './types/tab.types';

const props = defineProps<TabsProps>();
const emit = defineEmits<TabsEmits>();

const value = computed({
  get() {
    return props.modelValue || '';
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});
const options = ref(props.tabs);
</script>

<script lang="ts">
export default {
  name: 'LfxTabs'
};
</script>
