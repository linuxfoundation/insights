<template>
  <div class="relative">
    <pv-select
      v-model="value"
      :options="props.options"
      option-label="label"
      option-value="value"
      dropdown-icon="fa-light fa-chevron-down"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :size="size"
      append-to="self"
      :class="[`p-select--${props.type}`]">
      <template #value="slotProps">
        <div class="flex items-center gap-2">
          <i class="dropdown-icon fa-light fa-bars-filter" />
          <div v-if="slotProps.value">{{ getLabel(slotProps.value) }}</div>
          <div v-else>{{ slotProps.placeholder }}</div>
        </div>
      </template>

      <template #option="slotProps">
        <slot name="option" :option="slotProps.option">
          <div>
            <slot name="optionTemplate" :option="slotProps.option">
              {{ slotProps.option.label }}
            </slot>
          </div>
          <i class="p-select-option-icon fa-light fa-check" />
        </slot>
      </template>
    </pv-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownProps } from './types/dropdown.types';

const props = withDefaults(defineProps<DropdownProps>(), {
  placeholder: 'Select an option',
  disabled: false,
  type: 'filled',
  size: 'default'
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: string) {
    emit('update:modelValue', val);
  }
});

const size = computed(() => (props.size === 'small' ? 'small' : 'large'));

const getLabel = (value: string) => props.options.find((option) => option.value === value)?.label || '';
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown'
};
</script>
