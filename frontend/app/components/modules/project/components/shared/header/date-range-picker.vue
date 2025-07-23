<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="z-10 bottom-0 left-0 relative shadow-none border-none
      bg-white border border-neutral-200 rounded-full"
  >
    <lfx-dropdown-select
      v-model="selectedDateRange"
      placement="bottom-end"
      width="22.5rem"
    >
      <template #trigger="{selectedOption}">
        <lfx-dropdown-selector class="whitespace-nowrap !bg-transparent !text-xs sm:!text-sm !py-1 sm:py-2">
          <lfx-icon
            name="calendar"
            :size="16"
            class="!hidden sm:!inline-block"
          />
          <lfx-icon
            name="calendar"
            :size="14"
            class="!inline-block sm:!hidden"
          />
          <span v-if="selectedOption.value !== 'custom'">{{ selectedOption?.label }}</span>
          <span v-else-if="startDate && endDate">
            {{ DateTime.fromFormat(startDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
            -> {{ DateTime.fromFormat(endDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
          </span>
          <span v-else>Custom</span>
          <template
            v-if="pageWidth < 640"
            #append
          >
            <span class="hidden" />
          </template>
        </lfx-dropdown-selector>
      </template>

      <lfx-dropdown-item
        v-for="option of lfxProjectDateOptionsPast"
        :key="option.key"
        :value="option.key"
        :label="option.label"
        :checkmark-before="true"
      >
        <div class="flex justify-between items-center w-full">
          <p>
            {{ option.label }}
          </p>
          <div
            v-if="option.description"
            class="text-xs leading-5 text-neutral-400"
          >
            {{ option.description }}
          </div>
        </div>
      </lfx-dropdown-item>

      <lfx-dropdown-separator />

      <lfx-dropdown-item
        v-for="option of lfxProjectDateOptionsPrevious"
        :key="option.key"
        :value="option.key"
        :label="option.label"
        :checkmark-before="true"
      >
        <div class="flex justify-between items-center w-full">
          <p>
            {{ option.label }}
          </p>
          <div
            v-if="option.description"
            class="text-xs leading-5 text-neutral-400"
          >
            {{ option.description }}
          </div>
        </div>
      </lfx-dropdown-item>

      <lfx-dropdown-separator />
      <lfx-dropdown-item
        v-for="option of lfxProjectDateOptionsGeneral"
        :key="option.key"
        :value="option.key"
        :label="option.label"
        :checkmark-before="true"
      >
        <div class="flex justify-between items-center w-full">
          <p>
            {{ option.label }}
          </p>
          <div
            v-if="option.description"
            class="text-xs leading-5 text-neutral-400"
          >
            {{ option.description }}
          </div>
        </div>
      </lfx-dropdown-item>

      <lfx-dropdown-item
        value="custom"
        label="Custom"
        :checkmark-before="true"
        @click="isCustomSelectorOpen = true"
      >
        Custom
      </lfx-dropdown-item>

    </lfx-dropdown-select>

    <lfx-project-custom-date-range-picker
      v-model="isCustomSelectorOpen"
      @select="changeSelected($event)"
    />
  </div>

</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import { storeToRefs } from "pinia";
import { DateTime } from 'luxon';
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {
  type DateOptionConfig, lfxProjectDateOptions, lfxProjectDateOptionsGeneral,
  lfxProjectDateOptionsPast,
  lfxProjectDateOptionsPrevious
} from "~/components/modules/project/config/date-options";
import { defaultTimeRangeKey, useProjectStore } from "~/components/modules/project/store/project.store";
import LfxProjectCustomDateRangePicker
  from "~/components/modules/project/components/shared/header/custom-date-range-picker.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import { useQueryParam } from "~/components/shared/utils/query-param";
import {
  processProjectParams,
  projectParamsSetter
} from "~/components/modules/project/services/project.query.service";
import useResponsive from "~/components/shared/utils/responsive";

const { selectedTimeRangeKey, startDate, endDate } = storeToRefs(useProjectStore())
const { queryParams } = useQueryParam(processProjectParams, projectParamsSetter);
const isOpen = ref(false);
const isCustomSelectorOpen = ref(false);
const { pageWidth } = useResponsive();

const selectedDateRange = ref(selectedTimeRangeKey.value || defaultTimeRangeKey);

const changeSelected = (option: DateOptionConfig) => {
  selectedTimeRangeKey.value = option.key;
  startDate.value = option.startDate;
  endDate.value = option.endDate;
  isOpen.value = false;

  queryParams.value = {
    timeRange: option.key,
    start: startDate.value || null,
    end: endDate.value || null,
  };
}

watch(() => selectedDateRange.value, (value) => {
  const option = lfxProjectDateOptions.find((option) => option.key === value) as DateOptionConfig;

  if(option){
    changeSelected(option);
  }
}, {
  immediate: true
})

watch(() => queryParams.value, (value) => {
  if (selectedTimeRangeKey.value !== value.timeRange
    || (startDate.value !== value.start || endDate.value !== value.end)) {
      selectedDateRange.value = value.timeRange || defaultTimeRangeKey;
      if (value.timeRange === 'custom') {
        startDate.value = value.start || null;
        endDate.value = value.end || null;
      }
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDateRangePicker'
};
</script>
