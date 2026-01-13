<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="42.5rem"
  >
    <div class="p-6">
      <h3 class="text-heading-3 font-secondary font-bold pb-6">Custom time range</h3>
      <div class="grid grid-cols-2 gap-5">
        <lfx-datepicker
          ref="startDatepickerRef"
          v-model="dateRange"
          inline
          selection-mode="range"
          class="custom-inline-datepicker"
          :manual-input="false"
          :max-date="new Date()"
          :pt="{
            selectMonth: {
              disabled: false,
              class: 'p-button p-button-pill p-button-tertiary',
            },
            selectYear: {
              disabled: false,
              class: 'p-button p-button-pill p-button-tertiary',
            },
          }"
        />
        <lfx-datepicker
          ref="endDatepickerRef"
          v-model="dateRange"
          inline
          selection-mode="range"
          class="custom-inline-datepicker"
          :manual-input="false"
          :max-date="new Date()"
          :pt="{
            selectMonth: {
              disabled: false,
              class: 'p-button p-button-pill p-button-tertiary',
            },
            selectYear: {
              disabled: false,
              class: 'p-button p-button-pill p-button-tertiary',
            },
          }"
        />
      </div>
      <div class="flex justify-end gap-4 pt-6">
        <lfx-button
          type="tertiary"
          @click="isModalOpen = false"
        >
          Cancel
        </lfx-button>
        <lfx-button
          :disabled="!dateRange || !dateRange[0] || !dateRange[1]"
          @click="select()"
        >
          Apply
        </lfx-button>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { DateTime } from 'luxon';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxDatepicker from '~/components/uikit/datepicker/datepicker.vue';
import type { DateOptionConfig } from '~/components/modules/project/config/date-options';

const props = defineProps<{
  modelValue: boolean;
  initialStartDate?: string | null;
  initialEndDate?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', value: DateOptionConfig): void;
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

// Initialize dateRange from props if provided
const getInitialDateRange = (): [Date, Date] | null => {
  if (props.initialStartDate && props.initialEndDate) {
    return [
      DateTime.fromFormat(props.initialStartDate, 'yyyy-MM-dd').toJSDate(),
      DateTime.fromFormat(props.initialEndDate, 'yyyy-MM-dd').toJSDate(),
    ];
  }
  return null;
};

const dateRange = ref<[Date, Date] | null>(getInitialDateRange());

// Refs to datepicker components
const startDatepickerRef = ref<{ setViewDate: (date: Date) => void } | null>(null);
const endDatepickerRef = ref<{ setViewDate: (date: Date) => void } | null>(null);

// Watch modal open to initialize dateRange and set correct view dates on datepickers
watch(isModalOpen, (open) => {
  if (open) {
    // Re-initialize dateRange from props when modal opens
    dateRange.value = getInitialDateRange();

    // Use nextTick to ensure datepickers are mounted before setting view
    nextTick(() => {
      let startViewMonth: Date;
      let endViewMonth: Date;

      if (dateRange.value?.[0]) {
        // Use the selected start date's month
        startViewMonth = new Date(dateRange.value[0].getFullYear(), dateRange.value[0].getMonth(), 1);
      } else {
        // Default to month before the current month
        const now = new Date();
        startViewMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }

      if (dateRange.value?.[1]) {
        // Use the selected end date's month
        endViewMonth = new Date(dateRange.value[1].getFullYear(), dateRange.value[1].getMonth(), 1);
      } else {
        // Default to next month after start date
        endViewMonth = new Date(startViewMonth.getFullYear(), startViewMonth.getMonth() + 1, 1);
      }

      startDatepickerRef.value?.setViewDate(startViewMonth);
      endDatepickerRef.value?.setViewDate(endViewMonth);
    });
  }
});

const select = () => {
  if (!dateRange.value) return;
  const [start, end] = dateRange.value;
  emit('select', {
    key: 'custom',
    label: 'Custom',
    startDate: DateTime.fromJSDate(start).toFormat('yyyy-MM-dd'),
    endDate: DateTime.fromJSDate(end).toFormat('yyyy-MM-dd'),
  });
  emit('update:modelValue', false);
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCustomDateRangePicker',
};
</script>
