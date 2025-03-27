<template>
  <div>
    <lfx-dropdown-select
      v-model="selectedDateRange"
      placement="bottom-end"
      width="22.5rem"
    >
      <template #trigger="{selectedOption}">
        <lfx-dropdown-selector>
          <lfx-icon
            name="calendar"
            :size="16"
          />
          <span v-if="selectedOption.value !== 'custom'">{{ selectedOption?.label }}</span>
          <span v-else-if="startDate && endDate">
            {{ DateTime.fromFormat(startDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
            -> {{ DateTime.fromFormat(endDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
          </span>
          <span v-else>Custom</span>
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
  lfxProjectDateOptionsPrevious,
  dateOptKeys
} from "~/components/modules/project/config/date-options";
import { useProjectStore } from "~/components/modules/project/store/project.store";
import LfxProjectCustomDateRangePicker
  from "~/components/modules/project/components/shared/header/custom-date-range-picker.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";

const { selectedTimeRangeKey, startDate, endDate } = storeToRefs(useProjectStore())

const isOpen = ref(false);
const isCustomSelectorOpen = ref(false);

const selectedDateRange = ref(dateOptKeys.past365days);

const changeSelected = (option: DateOptionConfig) => {
  selectedTimeRangeKey.value = option.key;
  startDate.value = option.startDate;
  endDate.value = option.endDate;
  isOpen.value = false;
}

watch(() => selectedDateRange.value, (value) => {
  const option = lfxProjectDateOptions.find((option) => option.key === value) as DateOptionConfig;
  if(option){
    changeSelected(option);
  }
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDateRangePicker'
};
</script>
