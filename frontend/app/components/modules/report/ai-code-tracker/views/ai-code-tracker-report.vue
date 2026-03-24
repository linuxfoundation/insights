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

      <p class="text-body-1 text-neutral-600">
        <span class="font-semibold text-neutral-900">{{ formatNumber(totalAiCommits) }}</span>
        out of
        <span class="font-semibold text-neutral-900">{{ formatNumber(totalCommits) }}</span>
        commits across
        <span class="font-semibold text-neutral-900">13,500</span>
        critical OSS projects were AI-assisted
      </p>
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
      <lfx-ai-commits-time-chart
        :data="filteredTimeSeriesData"
        :period-totals="filteredPeriodTotals"
        :granularity="granularity"
        :show-percentage="showPercentage"
      />
    </lfx-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DateTime } from 'luxon';
import LfxAiCommitsTimeChart from '../components/ai-commits-time-chart.vue';
import {
  AI_TOOL_TIME_SERIES_DATA_MONTHLY,
  AI_TOOL_TIME_SERIES_DATA_YEARLY,
  PERIOD_TOTAL_COMMITS_MONTHLY,
  PERIOD_TOTAL_COMMITS_YEARLY,
} from '../config/ai-code-tracker-mock-data';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import { formatNumber } from '~/components/shared/utils/formatter';

const now = DateTime.local();

const dateOptions = [
  {
    key: 'past12months',
    label: 'Past 12 months',
    description: `${now.minus({ months: 12 }).toFormat('MMM yyyy')} → ${now.minus({ months: 1 }).toFormat('MMM yyyy')}`,
  },
  {
    key: 'past5years',
    label: 'Past 5 years',
    description: `${now.minus({ years: 5 }).toFormat('yyyy')} → ${now.minus({ years: 1 }).toFormat('yyyy')}`,
  },
  {
    key: 'alltime',
    label: 'All time',
    description: '',
  },
];

const selectedDateRange = ref('past12months');
const granularity = computed(() => (selectedDateRange.value === 'past12months' ? 'monthly' : 'yearly'));

const displayTabs = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'count', label: 'Count' },
];
const displayMode = ref('percentage');
const showPercentage = computed(() => displayMode.value === 'percentage');

const filteredTimeSeriesData = computed(() => {
  if (selectedDateRange.value === 'past12months') {
    return AI_TOOL_TIME_SERIES_DATA_MONTHLY;
  }
  if (selectedDateRange.value === 'past5years') {
    return AI_TOOL_TIME_SERIES_DATA_YEARLY.slice(-5 * 8); // 5 years * 8 tools
  }
  // All time
  return AI_TOOL_TIME_SERIES_DATA_YEARLY;
});

const filteredPeriodTotals = computed(() => {
  if (selectedDateRange.value === 'past12months') {
    return PERIOD_TOTAL_COMMITS_MONTHLY;
  }
  if (selectedDateRange.value === 'past5years') {
    return PERIOD_TOTAL_COMMITS_YEARLY.slice(-5);
  }
  // All time
  return PERIOD_TOTAL_COMMITS_YEARLY;
});

const totalAiCommits = computed(() => filteredTimeSeriesData.value.reduce((sum, item) => sum + item.commitCount, 0));

const totalCommits = computed(() => filteredPeriodTotals.value.reduce((sum, item) => sum + item.totalCommits, 0));
</script>

<script lang="ts">
export default {
  name: 'LfxAiCodeTrackerReport',
};
</script>
