<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <lfx-tabs
      v-if="!isEmpty && !props.snapshot"
      class="mb-5"
      :tabs="tabs"
      :model-value="model.activeTab"
      @update:model-value="model.activeTab = $event"
    >
      <template #slotItem="{option}">
        <lfx-tooltip
          :content="option.value === 'packageDownloads' ? 
            'Primary Registry Package downloads' : 'Docker Package downloads'"
        >
          <span @click="model.activeTab = option.value">{{option.label}}</span>
        </lfx-tooltip>
      </template>
    </lfx-tabs>

    <div class="mb-5">
      <lfx-package-dropdown
        v-model="model.package"
        :packages="packages"
      />
    </div>

    <div class="mb-5">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div
          v-if="summary && !isEmpty"
          class="flex flex-wrap flex-row gap-4 items-center"
        >
          <div class="text-heading-1 sm:text-data-display-1">{{ formatNumber(summary.current) }}</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
          />
        </div>
      </lfx-skeleton-state>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching package downloads"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px] mt-5">
        <lfx-chart
          :config="lineChartConfig"
          :animation="!props.snapshot"
        />
      </div>
      <div class="flex justify-center items-center gap-2 text-xs text-neutral-400 mt-5">
        <lfx-icon
          name="info-circle"
          type="regular"
          :size="12"
        />
        Data available from June 2025 onward
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, watch } from 'vue';
import { storeToRefs } from "pinia";
import { DateTime } from 'luxon';
import LfxPackageDropdown from './fragments/package-dropdown.vue';
import type { Package, PackageDownloads } from '~~/types/popularity/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, currentInterval, removeZeroValues } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig, getMarkLine, getVisualMap } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import { POPULARITY_API_SERVICE } from '~/components/modules/widget/services/popularity.api.service';
import { EcosystemSeparator } from '~~/types/shared/ecosystems.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

interface PackageDownloadsModel {
  package: string;
  activeTab: string;
}

const props = defineProps<{
  modelValue: PackageDownloadsModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: PackageDownloadsModel): void;
}>();

const model = computed<PackageDownloadsModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const tabs = [
  { label: 'Package downloads', value: 'packageDownloads' },
  { label: 'Docker downloads', value: 'dockerDownloads' },
];

const selectedPackage = computed<Package | undefined>(() => {
  const [ecosystem, name] = model.value.package.split(EcosystemSeparator);

  if (ecosystem === 'all') {
    return undefined;
  }

  return packages.value.find((p) => p.ecosystem === ecosystem && p.name === name);
});

const selectedEcosystem = computed<string | undefined>(() => {
  const [ecosystem] = model.value.package.split(EcosystemSeparator);

  return ecosystem && ecosystem !== 'all' ? ecosystem : undefined;
});

const {
  startDate,
  endDate,
  selectedReposValues,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const downloadsParams = computed(() => ({
  projectSlug: route.params.slug as string,
  repos: selectedReposValues.value,
  granularity: granularity.value,
  startDate: startDate.value,
  endDate: endDate.value,
  ecosystem: selectedEcosystem.value,
  name: selectedPackage.value?.name,
}));

const packagesParams = computed(() => ({
  projectSlug: route.params.slug as string,
  repos: selectedReposValues.value,
  search: '',
}));

const {
  data, status, error, suspense
} = POPULARITY_API_SERVICE.fetchPackageDownloads(downloadsParams);

const {
  data: packagesData, status: packagesStatus, suspense: packagesSuspense
} = POPULARITY_API_SERVICE.fetchPackages(packagesParams);

const packages = computed(() => (packagesStatus.value === 'success' && packagesData.value ? packagesData.value : []));

onServerPrefetch(async () => {
  await suspense();
  await packagesSuspense()
});

const packageDownloads = computed<PackageDownloads>(() => data.value as PackageDownloads);

const summary = computed<Summary>(() => {
  const {
    periodFrom,
    periodTo,
    currentDownloads,
    previousDownloads,
    downloadsPercentageChange,
    downloadsChangeValue
  } = packageDownloads.value.summary;

  return {
    current: currentDownloads,
    previous: previousDownloads,
    percentageChange: downloadsPercentageChange,
    changeValue: downloadsChangeValue,
    periodFrom,
    periodTo,
  }
});
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    const tmpData = convertToChartData((packageDownloads.value?.data || []) as RawChartData[], 'startDate', [
      'downloadsCount',
      'dockerDownloadsCount',
    ], undefined, 'endDate');
    return removeZeroValues(tmpData, true);
  }
);

const isLastDataItemIncomplete = computed(() => {
  if (chartData.value.length > 0) {
    const lastItem = chartData.value[chartData.value.length - 1];
    const interval = currentInterval(granularity.value);

    return interval.contains(DateTime.fromISO(lastItem?.key || '').endOf('day'));
  }

  return false;
});

const columnBeforeLastItem = computed<string>(() => {
  if (chartData.value.length > 1) {
    const columnBeforeLastItem = chartData.value[chartData.value.length - 2];
    return DateTime.fromISO(columnBeforeLastItem?.key || '').toUTC().endOf('day').toMillis().toString();
  }
  return '';
});

const isEmpty = computed(() => {
  if (isEmptyData(chartData.value as unknown as Record<string, unknown>[])) {
    return true;
  }

  // Check if all values in the chart data are 0
  return chartData.value.every((dataPoint) => dataPoint.values[0] === 0 && dataPoint.values[1] === 0);
});

const chartSeries = computed<ChartSeries[]>(() => model.value.activeTab === 'packageDownloads' ? [
  {
    name: 'Primary Registry Package downloads',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
    lineWidth: 2,
    markLine: isLastDataItemIncomplete.value ? getMarkLine(columnBeforeLastItem.value) : undefined
  }
] : [
  {
    name: 'Docker Package downloads',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.brand[500],
    lineWidth: 2,
    markLine: isLastDataItemIncomplete.value ? getMarkLine(columnBeforeLastItem.value) : undefined
  }
]);

const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  granularity.value,
  (value: number, index?: number) => {
    if (index === 0) {
      return '';
    }
    return formatNumberShort(value);
  },
  isLastDataItemIncomplete.value ? {
    visualMap: getVisualMap(chartData.value.length, chartSeries.value)
  } : undefined
));

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.PACKAGE_DOWNLOADS);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPackageDownloads',
}
</script>
