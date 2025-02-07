<template>
  <pv-dropdown
    v-model="value"
    :options="props.options"
    :option-label="props.optionLabel"
    :option-value="props.optionValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :class="['lfx-dropdown', `lfx-dropdown--${props.type}`, props.size === 'small' ? 'lfx-dropdown--small' : '']">
    <template #value="slotProps">
      <slot name="value" :value="slotProps.value">
        {{ slotProps.value ? slotProps.value[props.optionLabel] : props.placeholder }}
      </slot>
    </template>
    <template #option="slotProps">
      <slot name="option" :option="slotProps.option">
        {{ slotProps.option[props.optionLabel] }}
      </slot>
    </template>
  </pv-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DropdownProps } from './types/dropdown.types';

const props = withDefaults(defineProps<DropdownProps>(), {
  optionLabel: 'label',
  optionValue: 'value',
  placeholder: 'Select an option',
  disabled: false,
  type: 'field',
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
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown'
};
</script>

<style lang="scss">
.lfx-dropdown {
  @apply w-full;

  &--field {
    .p-dropdown {
      @apply bg-white border border-neutral-200 rounded-lg w-full;

      &:not(.p-disabled):hover {
        @apply border-brand-500;
      }

      &:not(.p-disabled).p-focus {
        @apply border-brand-500 ring-2 ring-brand-100;
      }
    }
  }

  &--transparent {
    .p-dropdown {
      @apply bg-transparent border-none w-full;
    }
  }

  &--small {
    .p-dropdown {
      @apply text-sm py-1;
    }
  }

  .p-dropdown-panel {
    @apply border border-neutral-200 rounded-lg shadow-lg;
  }

  .p-dropdown-items {
    @apply py-1;
  }

  .p-dropdown-item {
    @apply px-4 py-2 text-neutral-700 hover:bg-neutral-50 cursor-pointer;

    &.p-highlight {
      @apply bg-brand-50 text-brand-500;
    }
  }
}
</style>
