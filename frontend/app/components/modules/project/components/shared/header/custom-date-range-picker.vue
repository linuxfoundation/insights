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
      <h3 class="text-heading-3 font-secondary font-bold pb-6">
        Custom time range
      </h3>
      <div>
        <lfx-datepicker
          v-model="dateRange"
          inline
          selection-mode="range"
          :manual-input="false"
          :number-of-months="2"
          :max-date="new Date()"
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
import {computed} from "vue";
import {DateTime} from 'luxon';
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxDatepicker from "~/components/uikit/datepicker/datepicker.vue";
import type {DateOptionConfig} from "~/components/modules/project/config/date-options";

const props = defineProps<{
  modelValue: boolean;
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void, (e: 'select', value: DateOptionConfig)}>()

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const dateRange = ref(null);
const select = () => {
  const [start, end] = dateRange.value;
  emit('select', {
    key: 'custom',
    label: 'Custom',
    startDate: DateTime.fromJSDate(start).toFormat('yyyy-MM-dd'),
    endDate: DateTime.fromJSDate(end).toFormat('yyyy-MM-dd')
  });
  emit('update:modelValue', false);
}
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCustomDateRangePicker'
};
</script>
