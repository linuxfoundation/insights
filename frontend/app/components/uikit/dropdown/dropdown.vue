<template>
  <div class="relative">
    <pv-select
      v-model="value"
      :options="props.options"
      option-label="label"
      option-value="value"
      dropdown-icon="fa-light fa-chevron-down"
      :option-group-label="isGrouped ? 'label' : undefined"
      :option-group-children="isGrouped ? 'items' : undefined"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :size="size"
      :filter="props.showFilter"
      filter-placeholder="Search..."
      filter-icon="fa-light fa-magnifying-glass"
      clear-icon="fa-solid fa-circle-xmark"
      reset-filter-on-clear="true"
      append-to="self"
      :class="[`p-select--${props.type}`, { 'p-select-group-breaks': props.showGroupBreaks }]">
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
      <!-- TODO: implement this -->
      <!-- <template #header>
        <button class="p-select-clear-filter" v-if="props.showFilter" @click="clearFilter">
          <i class="fa-solid fa-circle-xmark" />
        </button>
      </template> -->
    </pv-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownProps, DropdownOption, DropdownGroupOptions } from './types/dropdown.types';

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

const isGrouped = computed(() => props.options.some((option) => 'items' in option && Array.isArray(option.items)));

const getLabel = (value: string) => {
  if (isGrouped.value) {
    const flattenedOptions = props.options.flatMap((group) => (group as DropdownGroupOptions).items);
    return flattenedOptions.find((option) => option.value === value)?.label || '';
  }
  return (props.options as DropdownOption[]).find((option) => option.value === value)?.label || '';
};

// TODO: implement this
// const clearFilter = () => {
//   // value.value = '';
// };
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown'
};
</script>
