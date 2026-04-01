<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-6 md:py-10 flex flex-col gap-6">
    <div>
      <h1 class="text-heading-3 md:text-heading-1 font-secondary font-bold text-neutral-900 mb-2">
        CNCF Contributor Geographic Distribution
      </h1>
      <p class="text-body-2 md:text-body-1 text-neutral-600">
        Geographical distribution of contributing organizations across all CNCF projects
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
        v-if="overTimeData"
        class="flex items-center gap-2 text-body-1"
      >
        <span class="font-semibold text-neutral-900 text-heading-3">{{ overTimeData.totalCountries }}</span>
        <span class="text-neutral-500">countries</span>
      </div>
    </div>

    <lfx-card class="p-4 md:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">
          Geographical Distribution Over Time
        </h2>
        <lfx-tabs
          v-model="displayMode"
          :tabs="displayTabs"
          width-type="inline"
        />
      </div>
      <div v-if="overTimeStatus === 'pending'">
        <div class="flex flex-col gap-4 h-[400px] pt-4">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div v-else-if="overTimeError">
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
    </lfx-card>

    <lfx-card class="p-4 md:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">Country Share</h2>
        <div class="flex items-center gap-2">
          <lfx-toggle v-model="showEuropeAggregate"> Show Europe as aggregate </lfx-toggle>
          <lfx-tooltip
            content="Includes EU-27, UK, Switzerland, Norway, Ukraine, and other European countries"
            placement="top"
          >
            <lfx-icon
              name="circle-info"
              :size="14"
              class="text-neutral-400 cursor-help"
            />
          </lfx-tooltip>
        </div>
      </div>
      <div v-if="distributionStatus === 'pending'">
        <div class="flex flex-col gap-4 h-[400px] pt-4">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>
      <div v-else-if="distributionError">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-negative-500">Error loading data. Please try again.</div>
        </div>
      </div>
      <div v-else-if="distributionData.length === 0">
        <div class="flex items-center justify-center h-[400px]">
          <div class="text-neutral-500">No data available for the selected period.</div>
        </div>
      </div>
      <lfx-cncf-geo-pie-chart
        v-else
        :data="distributionData"
      />
    </lfx-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type ComputedRef } from 'vue';
import { DateTime } from 'luxon';
import { EUROPEAN_COUNTRY_CODES, EUROPE_AGGREGATE } from '../config/european-countries';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxToggle from '~/components/uikit/toggle/toggle.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxCncfGeoStackedChart from '~/components/modules/report/cncf/components/cncf-geo-stacked-chart.vue';
import LfxCncfGeoPieChart from '~/components/modules/report/cncf/components/cncf-geo-pie-chart.vue';
import { CNCF_REPORT_API_SERVICE } from '~/components/modules/report/cncf/services/cncf-report.api.service';
import type {
  CncfGeoDistributionOverTimeQueryParams,
  CncfGeoDistributionQueryParams,
  GeoDistributionOverTimeDataPoint,
} from '~~/types/report/cncf.types';

const COLLECTION = 'cncf';
const now = DateTime.local();
const endOfLastYear = now.startOf('year').minus({ days: 1 }).toFormat('yyyy-MM-dd');

const dateOptions = [
  {
    key: 'past12months',
    label: 'Past 12 months',
    startDate: now.minus({ months: 12 }).startOf('month').toFormat('yyyy-MM-dd'),
    endDate: now.minus({ months: 1 }).endOf('month').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ months: 12 }).toFormat('MMM yyyy')} -> ${now.minus({ months: 1 }).toFormat('MMM yyyy')}`,
  },
  {
    key: 'past5years',
    label: 'Past 5 years',
    startDate: now.minus({ years: 5 }).startOf('year').toFormat('yyyy-MM-dd'),
    endDate: endOfLastYear,
    description: `${now.minus({ years: 5 }).toFormat('yyyy')} -> ${now.minus({ years: 1 }).toFormat('yyyy')}`,
  },
  {
    key: 'alltime',
    label: 'All time',
    startDate: null,
    endDate: endOfLastYear,
    description: '',
  },
];

const selectedDateRange = ref('past12months');
const granularity = ref('monthly');

const displayTabs = [
  { value: 'absolute', label: 'Absolute' },
  { value: 'percentage', label: 'Percentage' },
];
const displayMode = ref('absolute');
const showPercentage = computed(() => displayMode.value === 'percentage');
const showEuropeAggregate = ref(false);

const selectedOption = computed(
  () => dateOptions.find((opt) => opt.key === selectedDateRange.value) || dateOptions[0],
) as ComputedRef<(typeof dateOptions)[number]>;

// Over time chart query
const overTimeParams = computed<CncfGeoDistributionOverTimeQueryParams>(() => ({
  collection: COLLECTION,
  granularity: granularity.value,
  startDate: selectedOption.value.startDate,
  endDate: selectedOption.value.endDate,
}));

const {
  data: overTimeData,
  status: overTimeStatus,
  error: overTimeError,
} = CNCF_REPORT_API_SERVICE.fetchGeoDistributionOverTime(overTimeParams);

const chartData = computed(() => {
  const raw = overTimeData.value?.data ?? [];
  if (raw.length === 0) return raw;

  // Calculate total contributors per country across all periods
  const countryTotals = new Map<string, number>();
  let grandTotal = 0;
  raw.forEach((item) => {
    countryTotals.set(item.countryCode, (countryTotals.get(item.countryCode) || 0) + item.contributorCount);
    grandTotal += item.contributorCount;
  });

  if (grandTotal === 0) return raw;

  // Countries above 1% threshold
  const significantCountries = new Set<string>();
  countryTotals.forEach((total, code) => {
    if ((total / grandTotal) * 100 >= 1) {
      significantCountries.add(code);
    }
  });

  // Group small countries into "Others" per time period
  const othersMap = new Map<string, GeoDistributionOverTimeDataPoint>();
  const result: GeoDistributionOverTimeDataPoint[] = [];

  raw.forEach((item) => {
    if (significantCountries.has(item.countryCode)) {
      result.push(item);
    } else {
      const key = item.startDate;
      const existing = othersMap.get(key);
      if (existing) {
        existing.contributorCount += item.contributorCount;
      } else {
        othersMap.set(key, {
          startDate: item.startDate,
          endDate: item.endDate,
          country: 'Others',
          countryCode: 'XX',
          flag: '🌍',
          contributorCount: item.contributorCount,
        });
      }
    }
  });

  othersMap.forEach((item) => result.push(item));
  return result;
});

// Distribution (pie chart) query
const distributionParams = computed<CncfGeoDistributionQueryParams>(() => ({
  collection: COLLECTION,
  startDate: selectedOption.value.startDate,
  endDate: selectedOption.value.endDate,
}));

const {
  data: distributionResponse,
  status: distributionStatus,
  error: distributionError,
} = CNCF_REPORT_API_SERVICE.fetchGeoDistribution(distributionParams);

const distributionData = computed(() => {
  const raw = distributionResponse.value?.data ?? [];
  if (raw.length === 0) return raw;

  // If Europe aggregate is enabled, combine European countries first
  let dataToProcess = raw;
  if (showEuropeAggregate.value) {
    const europeanItems = raw.filter((item) => EUROPEAN_COUNTRY_CODES.has(item.countryCode));
    const nonEuropeanItems = raw.filter((item) => !EUROPEAN_COUNTRY_CODES.has(item.countryCode));

    if (europeanItems.length > 0) {
      const europeTotal = europeanItems.reduce((sum, item) => sum + item.contributorCount, 0);
      dataToProcess = [
        ...nonEuropeanItems,
        {
          ...EUROPE_AGGREGATE,
          contributorCount: europeTotal,
          contributorPercentage: 0, // Will be recalculated
        },
      ];
    }
  }

  const totalContributors = dataToProcess.reduce((sum, item) => sum + item.contributorCount, 0);
  if (totalContributors === 0) return dataToProcess;

  const threshold = 1;
  const getPercentage = (count: number) => (count / totalContributors) * 100;
  const significant = dataToProcess
    .filter((item) => getPercentage(item.contributorCount) >= threshold)
    .sort((a, b) => b.contributorCount - a.contributorCount);
  const others = dataToProcess.filter((item) => getPercentage(item.contributorCount) < threshold);

  if (others.length === 0) return significant;

  const othersTotal = others.reduce((sum, item) => sum + item.contributorCount, 0);
  const othersPercentage = Math.round((othersTotal / totalContributors) * 100);

  return [
    ...significant,
    {
      country: 'Others',
      countryCode: 'XX',
      flag: '🌍',
      contributorCount: othersTotal,
      contributorPercentage: othersPercentage,
    },
  ];
});

watch(selectedDateRange, (newValue) => {
  if (newValue === 'past12months') {
    granularity.value = 'monthly';
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
