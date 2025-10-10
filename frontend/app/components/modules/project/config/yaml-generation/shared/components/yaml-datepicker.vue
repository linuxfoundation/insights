<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-datepicker
    v-model="model"
    v-bind="$attrs"
    type="date"
    :manual-input="false"
    date-format="mm/dd/yy"
    class="c-input"
  />
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import LfxDatepicker from "~/components/uikit/datepicker/datepicker.vue";

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

// Convert dd/mm/yyyy string to Date object
const stringToDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  const dt = DateTime.fromFormat(dateStr, 'dd/MM/yyyy');
  return dt.isValid ? dt.toJSDate() : null;
};

// Convert Date object to dd/mm/yyyy string
const dateToString = (date: Date | null): string | null => {
  if (!date) return null;
  return DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');
};

const model = computed({
  get: () => stringToDate(props.modelValue),
  set: (value: Date | null) => emit('update:modelValue', dateToString(value)),
})
</script>

<script lang="ts">
export default {
  name: 'LfxYamlDatepicker',
}
</script>
