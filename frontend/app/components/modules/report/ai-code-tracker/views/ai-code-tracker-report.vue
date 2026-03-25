<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-6 md:py-10 flex flex-col gap-6">
    <div>
      <h1 class="text-heading-3 md:text-heading-1 font-secondary font-bold text-neutral-900 mb-2">AI Code Tracker</h1>
      <p class="text-body-2 md:text-body-1 text-neutral-600">
        Tracking AI coding tool usage across the world's most critical open source projects
      </p>
    </div>

    <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-4">
        <lfx-dropdown-select
          v-model="selectedDateRange"
          placement="bottom-start"
          width="20rem"
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
        v-if="responseData"
        class="flex flex-col gap-1 text-right"
      >
        <p class="text-body-1 text-neutral-600">
          <span class="font-semibold text-neutral-900">{{ formatNumber(totalAiCommits) }}</span>
          out of
          <span class="font-semibold text-neutral-900">{{ formatNumber(totalCommits) }}</span>
          commits were AI-assisted
        </p>
        <p
          v-if="responseData.projectCount"
          class="text-body-2 text-neutral-500"
        >
          Tracked across
          <span class="font-semibold text-neutral-700">{{ formatNumber(responseData.projectCount) }}</span>
          most critical open-source projects
        </p>
      </div>
    </div>

    <lfx-card class="p-4 md:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">
          AI-Assisted Commits by Tool
        </h2>
        <lfx-tabs
          v-model="displayMode"
          :tabs="displayTabs"
          width-type="inline"
        />
      </div>

      <div v-if="status === 'pending'">
        <div class="flex flex-col gap-4 h-[400px] pt-4">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div v-else-if="error">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-negative-500">Error loading data. Please try again.</div>
        </div>
      </div>

      <div v-else-if="filteredData.length === 0">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-neutral-500">No data available for the selected period.</div>
        </div>
      </div>

      <lfx-ai-commits-time-chart
        v-else
        :data="filteredData"
        :period-totals="responseData?.periodTotals ?? []"
        :granularity="granularity"
        :show-percentage="showPercentage"
      />
    </lfx-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type ComputedRef } from 'vue';
import { DateTime } from 'luxon';
import LfxAiCommitsTimeChart from '../components/ai-commits-time-chart.vue';
import { AI_CODE_TRACKER_API_SERVICE } from '../services/ai-code-tracker.api.service';
import { AI_TOOL_RELEASE_DATES } from '../config/ai-tools';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { AiCodeTrackerQueryParams } from '~~/types/report/ai-code-tracker.types';

const now = DateTime.local();
const lastMonthEnd = now.minus({ months: 1 }).endOf('month').toFormat('yyyy-MM-dd');

const dateOptions = [
  {
    key: 'past12months',
    label: 'Past 12 months',
    startDate: now.minus({ months: 12 }).startOf('month').toFormat('yyyy-MM-dd'),
    endDate: lastMonthEnd,
    description: `${now.minus({ months: 12 }).toFormat('MMM yyyy')} \u2192 ${now.minus({ months: 1 }).toFormat('MMM yyyy')}`,
  },
  {
    key: 'past5years',
    label: 'Past 5 years',
    startDate: now.minus({ years: 5 }).startOf('month').toFormat('yyyy-MM-dd'),
    endDate: lastMonthEnd,
    description: `${now.minus({ years: 5 }).toFormat('MMM yyyy')} \u2192 ${now.minus({ months: 1 }).toFormat('MMM yyyy')}`,
  },
  {
    key: 'past10years',
    label: 'Past 10 years',
    startDate: now.minus({ years: 10 }).startOf('month').toFormat('yyyy-MM-dd'),
    endDate: lastMonthEnd,
    description: `${now.minus({ years: 10 }).toFormat('MMM yyyy')} \u2192 ${now.minus({ months: 1 }).toFormat('MMM yyyy')}`,
  },
];

const selectedDateRange = ref('past12months');
const granularity = 'monthly';

const displayTabs = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'count', label: 'Count' },
];
const displayMode = ref('percentage');
const showPercentage = computed(() => displayMode.value === 'percentage');

const selectedOption = computed(
  () => dateOptions.find((opt) => opt.key === selectedDateRange.value) || dateOptions[0],
) as ComputedRef<(typeof dateOptions)[number]>;

const queryParams = computed<AiCodeTrackerQueryParams>(() => ({
  granularity: granularity.value,
  startDate: selectedOption.value.startDate,
  endDate: selectedOption.value.endDate,
}));

const { data: responseData, status, error } = AI_CODE_TRACKER_API_SERVICE.fetchAiCodeTrackerData(queryParams);

// Filter out data points before the tool's actual release date (false positives)
const filteredData = computed(() =>
  (responseData.value?.data ?? []).filter((item) => {
    const releaseDate = AI_TOOL_RELEASE_DATES[item.toolKey];
    return !releaseDate || item.startDate >= releaseDate;
  }),
);

const totalAiCommits = computed(() => filteredData.value.reduce((sum, item) => sum + item.commitCount, 0));

const totalCommits = computed(() =>
  (responseData.value?.periodTotals ?? []).reduce((sum, item) => sum + item.totalCommits, 0),
);
</script>

<script lang="ts">
export default {
  name: 'LfxAiCodeTrackerReport',
};
</script>
