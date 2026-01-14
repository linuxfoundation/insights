<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <pv-date-picker
    ref="datepickerRef"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue';

interface DatePickerInstance extends ComponentPublicInstance {
  currentView: string;
  currentMonth: number;
  currentYear: number;
}

const datepickerRef = ref<DatePickerInstance | null>(null);

// Expose method to programmatically set the displayed month/year
const setViewDate = (date: Date) => {
  if (datepickerRef.value) {
    datepickerRef.value.currentMonth = date.getMonth();
    datepickerRef.value.currentYear = date.getFullYear();
  }
};

defineExpose({ setViewDate });
</script>

<script lang="ts">
export default {
  name: 'LfxDatepicker',
  inheritAttrs: false,
};
</script>
