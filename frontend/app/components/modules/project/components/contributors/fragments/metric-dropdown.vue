<template>
  <div class="flex flex-row gap-4 items-center mb-6">
    <lfx-dropdown
      v-model="metric"
      :split-lines="[1]"
      icon="fa-light fa-display-code"
      :options="metricOptions"
      full-width
      center
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { metricsOptions } from '../config/metrics';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import type {DropdownGroupOptions, DropdownOption} from '~/components/uikit/dropdown/types/dropdown.types';

const metricOptions = metricsOptions.map((option: DropdownGroupOptions) => ({
  label: option.label,
  items: option.items.map((item: DropdownOption) => ({
    label: item.label,
    value: option.label ? `${option.label.toLowerCase()}:${item.value}` : `all:${item.value}`
  }))
}));

const props = defineProps<{
  modelValue: string;
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
</script>

<script lang="ts">
export default {
  name: 'LfxMetricDropdown'
};
</script>
