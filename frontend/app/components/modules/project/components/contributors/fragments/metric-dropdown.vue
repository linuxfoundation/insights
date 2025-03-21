<template>
  <lfx-dropdown
    v-model="metric"
    :split-lines="[1]"
    icon="fa-light fa-display-code"
    :options="metricOptions"
    :full-width="maxWidth ? false : true"
    :center="maxWidth ? false : true"
    :dropdown-position="maxWidth ? 'right' : 'left'"
  >
    <template #optionTemplate="{ option }">
      <span class="flex gap-2 items-center">
        <img
          v-if="getIcon(option.value)"
          :src="getIcon(option.value)"
          class="w-4 h-4"
        >
        {{ option.label }}
      </span>
    </template>
  </lfx-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { metricsOptions, activityPlatformsIcons } from '../config/metrics';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import type { DropdownGroupOptions, DropdownOption } from '~/components/uikit/dropdown/types/dropdown.types';

const metricOptions = metricsOptions.map((option: DropdownGroupOptions) => ({
  label: option.label,
  items: option.items.map((item: DropdownOption) => ({
    label: item.label,
    value: option.label ? `${option.label.toLowerCase()}:${item.value}` : `all:${item.value}`
  }))
}));

const props = defineProps<{
  modelValue: string;
  maxWidth?: string;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();

const metric = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const getIcon = (value: string) => {
  const platform = value.split(':')[0];
  return platform !== 'all' ? activityPlatformsIcons[platform?.toString() ?? ''] : '';
};
</script>

<script lang="ts">
export default {
  name: 'LfxMetricDropdown'
};
</script>
