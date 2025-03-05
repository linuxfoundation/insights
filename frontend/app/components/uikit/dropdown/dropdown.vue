<template>
  <div
    class="relative"
    :class="{ 'w-full': props.fullWidth }"
  >
    <pv-select
      ref="filterRef"
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
      :reset-filter-on-clear="true"
      append-to="self"
      :auto-filter-focus="true"
      :reset-filter-on-hide="true"
      :class="[
        `p-select--${props.type}`,
        { 'p-select-group-breaks': props.showGroupBreaks },
        { 'p-select-full-width': props.fullWidth },
        { 'p-select-centered': props.center },
        { 'p-select-icon-only-mobile': props.iconOnlyMobile },
        `p-select-dropdown-${props.dropdownPosition}`
      ]"
      @filter="selectFilter"
    >
      <template #value="slotProps">
        <div :class="props.iconOnlyMobile ? '!mr-0 sm:!mr-2' : ''">
          <i :class="['dropdown-icon', props.icon]" />
          <div
            class="items-center gap-0.5"
            :class="props.iconOnlyMobile ? 'hidden sm:flex' : 'flex'"
          >
            <span
              v-if="props.prefix"
              class="font-medium"
            >{{ props.prefix }}:</span>
            <div :class="props.prefix ? 'font-normal' : 'font-medium'">
              {{ slotProps.value ? getLabel(slotProps.value) : slotProps.placeholder }}
            </div>
          </div>
        </div>
      </template>

      <template #optiongroup="slotProps">
        <div v-if="slotProps.option.label">
          {{ slotProps.option.label }}
        </div>
      </template>

      <template #option="slotProps">
        <slot
          name="option"
          :option="slotProps.option"
        >
          <div
            class="flex items-center justify-between w-full"
            :class="{ 'mb-2': props.splitLines?.includes(slotProps.index) }"
          >
            <div>
              <slot
                name="optionTemplate"
                :option="slotProps.option"
              >
                {{ slotProps.option.label }}
              </slot>
            </div>
            <i class="p-select-option-icon fa-light fa-check" />
          </div>
        </slot>
        <hr
          v-if="props.splitLines?.includes(slotProps.index)"
          class="split-line"
        >
      </template>
      <template #header>
        <i
          v-if="props.showFilter && filter.length > 0"
          class="fa-solid fa-circle-xmark p-select-clear-filter"
          @click="clearFilter"
        />
      </template>
    </pv-select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DropdownProps, DropdownOption, DropdownGroupOptions } from './types/dropdown.types';

const props = withDefaults(defineProps<DropdownProps>(), {
  placeholder: 'Select an option',
  disabled: false,
  type: 'filled',
  size: 'default',
  icon: 'fa-light fa-bars-filter',
  dropdownPosition: 'left',
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
const filter = ref('');
const filterRef = ref();

const getLabel = (value: string) => {
  if (isGrouped.value) {
    const flattenedOptions = props.options.flatMap(
      (group) => (group as DropdownGroupOptions).items
    );
    return flattenedOptions.find((option) => option.value === value)?.label || '';
  }
  return (props.options as DropdownOption[]).find((option) => option.value === value)?.label || '';
};

const clearFilter = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  filter.value = '';
  filterRef.value.filterValue = '';
};

const selectFilter = ({ value }: { value: string }) => {
  filter.value = value;
};
</script>

<script lang="ts">
export default {
  name: 'LfxDropdown'
};
</script>
