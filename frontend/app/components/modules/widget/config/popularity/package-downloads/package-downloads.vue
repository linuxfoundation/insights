<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
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
          v-if="summary"
          class="flex flex-row gap-4 items-center"
        >
          <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
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
      error-message="Error fetching social mentions"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px] mt-5">
        <lfx-chart
          :config="lineChartConfig"
          :animation="!props.snapshot"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, watch } from 'vue';
import { storeToRefs } from "pinia";
import LfxPackageDropdown from './fragments/package-dropdown.vue';
import type { Package, PackageDownloads } from '~~/types/popularity/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
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

interface PackageDownloadsModel {
  package: string;
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
  selectedRepository,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const downloadsParams = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value,
  granularity: granularity.value,
  startDate: startDate.value,
  endDate: endDate.value,
  ecosystem: selectedEcosystem.value,
  name: selectedPackage.value?.name,
}));

const packagesParams = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value,
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
  () => convertToChartData((packageDownloads.value?.data || []) as RawChartData[], 'startDate', [
    'downloadsCount',
    'dockerDownloadsCount',
  ], undefined, 'endDate')
);
const isEmpty = computed(() => {
  if (isEmptyData(chartData.value as unknown as Record<string, unknown>[])) {
    return true;
  }

  // Check if all values in the chart data are 0
  return chartData.value.every((dataPoint) => dataPoint.values[0] === 0 && dataPoint.values[1] === 0);
});

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Total package downloads',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
    lineWidth: 2
  },
  {
    name: 'Docker downloads',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    lineStyle: 'dotted',
    color: lfxColors.neutral[500],
    lineWidth: 2
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
  }
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
