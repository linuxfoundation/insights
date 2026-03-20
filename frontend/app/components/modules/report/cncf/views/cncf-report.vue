<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900 mb-2">
        CNCF Contributor Geographic Distribution
      </h1>
      <p class="text-neutral-600">
        Geographical distribution of contributors across all CNCF projects over time
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <lfx-dropdown-select
          v-model="selectedDateRange"
          placement="bottom-start"
          width="16rem"
        >
          <template #trigger="{ selectedOption }">
            <lfx-dropdown-selector class="whitespace-nowrap !text-sm">
              <lfx-icon
                name="calendar"
                :size="16"
              />
              <span>{{ selectedOption?.label }}</span>
            </lfx-dropdown-selector>
          </template>
          <lfx-dropdown-item
            v-for="option of dateOptions"
            :key="option.key"
            :value="option.key"
            :label="option.label"
            :checkmark-before="true"
          >
            <div class="flex justify-between items-center w-full">
              <p>{{ option.label }}</p>
              <div
                v-if="option.description"
                class="text-xs leading-5 text-neutral-400"
              >
                {{ option.description }}
              </div>
            </div>
          </lfx-dropdown-item>
        </lfx-dropdown-select>
      </div>

      <div
        v-if="summary"
        class="flex items-center gap-2 text-sm"
      >
        <span class="font-semibold text-neutral-900 text-lg">{{ summary.totalCountries }}</span>
        <span class="text-neutral-500">countries</span>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-neutral-900">
          Contributor Distribution Over Time
        </h2>
        <div class="flex items-center gap-2">
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-l-md border',
              !showPercentage
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            ]"
            @click="showPercentage = false"
          >
            Absolute
          </button>
          <button
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-r-md border -ml-px',
              showPercentage
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            ]"
            @click="showPercentage = true"
          >
            Percentage
          </button>
        </div>
      </div>
      <div v-if="status === 'pending'">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-neutral-500">Loading...</div>
        </div>
      </div>

      <div v-else-if="error">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-negative-500">Error loading data. Please try again.</div>
        </div>
      </div>

      <div v-else-if="chartData.length === 0">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-neutral-500">No data available for the selected period.</div>
        </div>
      </div>

      <lfx-cncf-geo-stacked-chart
        v-else
        :data="chartData"
        :granularity="granularity"
        :show-percentage="showPercentage"
      />
    </div>

    <div
      v-if="chartData.length > 0"
      class="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mt-6"
    >
      <h2 class="text-lg font-semibold text-neutral-900 mb-4">
        Country Share
      </h2>
      <lfx-cncf-geo-pie-chart :data="chartData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { DateTime } from 'luxon';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxCncfGeoStackedChart from '~/components/modules/report/cncf/components/cncf-geo-stacked-chart.vue';
import LfxCncfGeoPieChart from '~/components/modules/report/cncf/components/cncf-geo-pie-chart.vue';
import { CNCF_REPORT_API_SERVICE } from '~/components/modules/report/cncf/services/cncf-report.api.service';
import type { CncfGeoTimeseriesQueryParams } from '~~/types/report/cncf.types';

const now = DateTime.local();

const dateOptions = [
  {
    key: 'past12months',
    label: 'Past 12 months',
    startDate: now.minus({ months: 12 }).startOf('month').toFormat('yyyy-MM-dd'),
    endDate: now.endOf('month').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ months: 12 }).toFormat('MMM yyyy')} -> ${now.toFormat('MMM yyyy')}`,
  },
  {
    key: 'past5years',
    label: 'Past 5 years',
    startDate: now.minus({ years: 5 }).startOf('year').toFormat('yyyy-MM-dd'),
    endDate: now.endOf('year').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ years: 5 }).toFormat('yyyy')} -> ${now.toFormat('yyyy')}`,
  },
  {
    key: 'alltime',
    label: 'All time',
    startDate: null,
    endDate: null,
    description: '',
  },
];

const selectedDateRange = ref('past12months');
const granularity = ref('monthly');
const showPercentage = ref(false);

const selectedOption = computed(
  () => dateOptions.find((opt) => opt.key === selectedDateRange.value) || dateOptions[0],
);

const queryParams = computed<CncfGeoTimeseriesQueryParams>(() => ({
  startDate: selectedOption.value.startDate,
  endDate: selectedOption.value.endDate,
  granularity: granularity.value,
  limit: 10,
}));

const { data, status, error } = CNCF_REPORT_API_SERVICE.fetchGeoTimeseries(queryParams);

const chartData = computed(() => data.value?.data ?? []);
const summary = computed(() => data.value?.summary);

watch(selectedDateRange, (newValue) => {
  if (newValue === 'past12months') {
    granularity.value = 'monthly';
  } else if (newValue === 'past5years') {
    granularity.value = 'quarterly';
  } else {
    granularity.value = 'yearly';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxCncfReport',
};
</script>
