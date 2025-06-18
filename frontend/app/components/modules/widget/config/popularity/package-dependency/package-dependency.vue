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

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching social mentions"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px] my-5">
        <lfx-chart
          :config="barChartConfig"
          :animation="!props.snapshot"
        />
      </div>

      <div class="flex flex-col gap-4">
        <lfx-project-package-legend-item
          v-for="(series, index) in chartSeries"
          :key="index"
          :title="series.name"
          :delta="getSummary(index)!"
          :color="series.color!"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, watch } from 'vue';
import { storeToRefs } from "pinia";
import LfxPackageDropdown from '../package-downloads/fragments/package-dropdown.vue';
import LfxProjectPackageLegendItem from './fragments/package-legend-item.vue';
import type { Package, PackageDownloads } from '~~/types/popularity/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { barGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';
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
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));

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

const dependentReposSummary = computed<Summary | undefined>(() => ({
  current: 0,
  previous: 0,
  percentageChange: 0,
  changeValue: 0,
  periodFrom: '',
  periodTo: ''
})); // packageDownloads.value?.dependentReposSummary);
const dependentPackagesSummary = computed<Summary | undefined>(() => ({
  current: 0,
  previous: 0,
  percentageChange: 0,
  changeValue: 0,
  periodFrom: '',
  periodTo: ''
})); // packageDownloads.value?.dependentPackagesSummary);
const dockerDependentsSummary = computed<Summary | undefined>(() => ({
  current: 0,
  previous: 0,
  percentageChange: 0,
  changeValue: 0,
  periodFrom: '',
  periodTo: ''
})); // packageDownloads.value?.dockerDependentsSummary);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((packageDownloads.value?.data || []) as RawChartData[], 'startDate', [
    'dependentReposCount',
    'dependentPackagesCount',
    'dockerDependentsCount',
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
    name: 'Dependent repositories',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  },
  {
    name: 'Dependent packages',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.brand[200]
  },
  {
    name: 'Dependent Docker packages',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.brand[800]
  }
]);

const barChartConfig = computed(() => getBarChartConfigStacked(
  chartData.value,
  chartSeries.value,
  granularity.value,
  {
    yAxis: {
      axisLabel: {
        formatter: (value: number, index?: number) => {
          if (index === 0) {
            return '';
          }
          return formatNumberShort(value);
        }
      }
    },
  }
));

const getSummary = (index: number) => {
  switch (index) {
    case 0:
      return dependentReposSummary.value;
    case 1:
      return dependentPackagesSummary.value;
    default:
      return dockerDependentsSummary.value;
  }
};

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
  name: 'LfxProjectPackageDependency',
}
</script>
