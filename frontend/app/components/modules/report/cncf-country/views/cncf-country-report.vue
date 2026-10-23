<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-6 md:py-10 flex flex-col gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-heading-3 md:text-heading-1 font-secondary font-bold text-neutral-900 mb-2">
          Cloud Native in {{ country.name }}
        </h1>
        <p class="text-body-2 md:text-body-1 text-neutral-600">
          Contributions to CNCF projects from people in {{ country.name }} and from organizations with
          {{ country.adjective }} HQ.
        </p>
      </div>

      <lfx-dropdown-select
        v-model="selectedDateRange"
        placement="bottom-end"
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
            <div class="text-xs leading-5 text-neutral-400">{{ option.description }}</div>
          </div>
        </lfx-dropdown-item>
      </lfx-dropdown-select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      <lfx-card
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="p-4 md:p-5 flex flex-col gap-1"
      >
        <span class="text-body-2 text-neutral-500">{{ kpi.label }}</span>
        <lfx-skeleton
          v-if="summaryStatus === 'pending'"
          height="32px"
          width="60%"
        />
        <span
          v-else-if="summaryError || !summary"
          class="text-body-2 text-negative-500"
        >
          Unavailable
        </span>
        <span
          v-else
          class="text-heading-3 md:text-heading-2 font-bold text-neutral-900"
        >
          {{ kpi.value }}
        </span>
      </lfx-card>
    </div>

    <lfx-card class="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">
          Who counts as {{ country.adjective }}
        </h2>
        <p class="text-body-2 text-neutral-500">
          A contributor counts when they live in {{ country.name }}, work for an organization with
          {{ country.adjective }} HQ, or both
        </p>
      </div>
      <lfx-skeleton
        v-if="summaryStatus === 'pending'"
        height="96px"
        width="100%"
      />
      <div
        v-else-if="summaryError || !summary"
        class="text-negative-500"
      >
        Error loading data. Please try again.
      </div>
      <lfx-cncf-country-split
        v-else
        :summary="summary"
        :country-name="country.name"
        :country-adjective="country.adjective"
      />
    </lfx-card>

    <lfx-card class="p-4 md:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">Activity over time</h2>
        <lfx-tabs
          v-model="activityMetric"
          :tabs="activityTabs"
          width-type="inline"
        />
      </div>
      <lfx-skeleton
        v-if="timeseriesStatus === 'pending'"
        height="360px"
        width="100%"
      />
      <div
        v-else-if="timeseriesError"
        class="flex items-center justify-center h-[360px] text-negative-500"
      >
        Error loading data. Please try again.
      </div>
      <div
        v-else-if="!timeseries?.data.length"
        class="flex items-center justify-center h-[360px] text-neutral-500"
      >
        No data available for the selected period.
      </div>
      <lfx-cncf-country-activity-chart
        v-else
        :data="timeseries.data"
        :metric="activityMetric"
        :label="activityLabel"
        :granularity="selectedOption.granularity"
      />
    </lfx-card>

    <lfx-card class="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">Top projects</h2>
        <p class="text-body-2 text-neutral-500">CNCF projects by {{ country.adjective }} contributors</p>
      </div>
      <lfx-skeleton
        v-if="projectsStatus === 'pending'"
        height="320px"
        width="100%"
      />
      <div
        v-else-if="projectsError"
        class="text-negative-500"
      >
        Error loading data. Please try again.
      </div>
      <lfx-cncf-country-projects
        v-else
        :projects="topProjects"
      />
    </lfx-card>

    <lfx-card class="p-4 md:p-6 flex flex-col gap-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-body-1 md:text-heading-3 font-secondary font-semibold text-neutral-900">Top organizations</h2>
          <p class="text-body-2 text-neutral-500">Organizations ranked by {{ country.adjective }} contributors</p>
        </div>
        <div class="flex items-center gap-2 text-body-2 text-neutral-600">
          <lfx-tag
            variation="info"
            size="small"
          >
            {{ country.code }}
          </lfx-tag>
          Organization with {{ country.adjective }} HQ
        </div>
      </div>
      <lfx-skeleton
        v-if="organizationsStatus === 'pending'"
        height="400px"
        width="100%"
      />
      <div
        v-else-if="organizationsError"
        class="text-negative-500"
      >
        Error loading data. Please try again.
      </div>
      <lfx-cncf-country-organizations
        v-else
        :organizations="organizations?.data ?? []"
        :country-code="country.code"
        :country-name="country.name"
      />
    </lfx-card>

    <p class="text-body-2 text-neutral-500 border-t border-neutral-200 pt-4">
      Methodology: a contributor is in {{ country.name }} when the country on their profile, or else their location,
      names {{ country.name }}. An organization has {{ country.adjective }} HQ when its record places its headquarters
      in {{ country.name }}. Contributions are code and collaboration activities in CNCF projects over the selected
      period.
    </p>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { computed, ref, type ComputedRef } from 'vue';

import LfxCncfCountryActivityChart from '~/components/modules/report/cncf-country/components/cncf-country-activity-chart.vue';
import LfxCncfCountryOrganizations from '~/components/modules/report/cncf-country/components/cncf-country-organizations.vue';
import LfxCncfCountryProjects from '~/components/modules/report/cncf-country/components/cncf-country-projects.vue';
import LfxCncfCountrySplit from '~/components/modules/report/cncf-country/components/cncf-country-split.vue';
import { CNCF_COUNTRY_REPORT_API_SERVICE } from '~/components/modules/report/cncf-country/services/cncf-country-report.api.service';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import type { CncfCountryActivityMetric, CncfCountryQueryParams } from '~~/types/report/cncf-country.types';

const props = defineProps<{
  country: { code: string; name: string; adjective: string };
}>();

// The collection's own foundation project ranks high but is not a project contributors work on.
const COLLECTION_PROJECT_SLUG = 'cncf';
const TOP_PROJECTS = 8;

const now = DateTime.local();

// endDate is exclusive: the pipes filter `timestamp < endDate` at midnight, so it is the day
// after the last day shown.
const dateOptions = [
  {
    key: 'past12months',
    label: 'Past 12 months',
    granularity: 'monthly',
    startDate: now.minus({ months: 12 }).startOf('month').toFormat('yyyy-MM-dd'),
    endDate: now.startOf('month').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ months: 12 }).toFormat('MMM yyyy')} -> ${now.minus({ months: 1 }).toFormat('MMM yyyy')}`,
  },
  {
    key: 'past10years',
    label: 'Past 10 years',
    granularity: 'yearly',
    startDate: now.minus({ years: 10 }).startOf('year').toFormat('yyyy-MM-dd'),
    endDate: now.startOf('year').toFormat('yyyy-MM-dd'),
    description: `${now.minus({ years: 10 }).toFormat('yyyy')} -> ${now.minus({ years: 1 }).toFormat('yyyy')}`,
  },
];

const selectedDateRange = ref('past12months');
const selectedOption = computed(
  () => dateOptions.find((option) => option.key === selectedDateRange.value) || dateOptions[0],
) as ComputedRef<(typeof dateOptions)[number]>;

const activityTabs = [
  { value: 'contributorCount', label: 'Contributors' },
  { value: 'contributionCount', label: 'Contributions' },
  { value: 'organizationCount', label: 'Organizations' },
];
const activityMetric = ref<CncfCountryActivityMetric>('contributorCount');
const activityLabel = computed(() => activityTabs.find((tab) => tab.value === activityMetric.value)?.label ?? '');

const params = computed<CncfCountryQueryParams>(() => ({
  countryCode: props.country.code,
  startDate: selectedOption.value.startDate,
  endDate: selectedOption.value.endDate,
}));

const {
  data: summary,
  status: summaryStatus,
  error: summaryError,
} = CNCF_COUNTRY_REPORT_API_SERVICE.fetchSummary(params);

const {
  data: timeseries,
  status: timeseriesStatus,
  error: timeseriesError,
} = CNCF_COUNTRY_REPORT_API_SERVICE.fetchTimeseries(
  computed(() => ({ ...params.value, granularity: selectedOption.value.granularity })),
);

const {
  data: projects,
  status: projectsStatus,
  error: projectsError,
} = CNCF_COUNTRY_REPORT_API_SERVICE.fetchProjects(computed(() => ({ ...params.value, limit: TOP_PROJECTS + 1 })));

const {
  data: organizations,
  status: organizationsStatus,
  error: organizationsError,
} = CNCF_COUNTRY_REPORT_API_SERVICE.fetchOrganizations(computed(() => ({ ...params.value, limit: 10 })));

const topProjects = computed(() =>
  (projects.value?.data ?? []).filter((project) => project.slug !== COLLECTION_PROJECT_SLUG).slice(0, TOP_PROJECTS),
);

const kpiCards = computed(() => [
  { label: 'Active contributors', value: formatNumber(summary.value?.contributorCount ?? 0) },
  { label: 'Contributions', value: formatNumberShort(summary.value?.contributionCount ?? 0) },
  {
    label: `Organizations with ${props.country.adjective} HQ active`,
    value: formatNumber(summary.value?.organizationCount ?? 0),
  },
]);
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountryReport',
};
</script>
