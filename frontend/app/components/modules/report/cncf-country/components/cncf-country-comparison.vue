<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <div class="max-w-full overflow-x-auto self-start">
      <lfx-tabs
        v-model="metric"
        :tabs="metricTabs"
        width-type="inline"
        class="!w-max"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-5 flex flex-col gap-5">
        <p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Selected period</p>
        <div
          v-for="row in rows"
          :key="row.label"
          class="flex flex-col gap-2"
        >
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-body-1 font-semibold text-neutral-900">{{ row.label }}</span>
            <span class="text-heading-4 font-bold text-neutral-900">{{ row.value }}</span>
          </div>
          <lfx-progress-bar
            :values="[row.share]"
            :color="row.color"
            hide-empty
          />
          <span class="text-body-2 text-neutral-500">{{ row.note }}</span>
        </div>
      </div>

      <div class="lg:col-span-7 flex flex-col gap-3">
        <p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {{ countryName }}'s share over time
        </p>
        <div class="h-[260px]">
          <client-only>
            <lfx-chart
              :config="chartConfig"
              :animation="true"
            />
          </client-only>
        </div>
        <ul
          class="sr-only"
          :aria-label="`${countryName}'s share per period`"
        >
          <li
            v-for="period in periods"
            :key="period.key"
          >
            {{ period.label }}: {{ period.regionShare }} of {{ regionName }}, {{ period.worldShare }} of the world
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { computed, ref } from 'vue';

import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { lfxColors } from '~/config/styles/colors';
import type { CncfCountryComparisonCounts, CncfCountryComparisonResponse } from '~~/types/report/cncf-country.types';

const props = defineProps<{
  comparison: CncfCountryComparisonResponse;
  countryName: string;
  granularity: string;
}>();

type Metric = 'Contributor' | 'Contribution' | 'Organization';

const metricTabs = [
  { value: 'Contributor', label: 'Contributors' },
  { value: 'Contribution', label: 'Code contributions' },
  { value: 'Organization', label: 'Organizations' },
];
const metric = ref<Metric>('Contributor');

const regionName = computed(() => props.comparison.regionName);

const counts = (source: CncfCountryComparisonCounts) => ({
  country: source[`country${metric.value}Count`],
  region: source[`region${metric.value}Count`],
  world: source[`world${metric.value}Count`],
});

const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const formatShare = (value: number) => `${value.toFixed(1)}%`;
const formatCount = (value: number) =>
  metric.value === 'Contribution' ? formatNumberShort(value) : formatNumber(value);

const worldNote = computed(
  () =>
    ({
      Contributor: 'Code contributors with a known location',
      Contribution: 'Code contributions from people with a known location',
      Organization: 'Active organizations with a known HQ',
    })[metric.value],
);

const rows = computed<{ label: string; value: string; share: number; note: string; color: ProgressBarType }[]>(() => {
  const { country, region, world } = counts(props.comparison.totals);
  return [
    { label: 'World', value: formatCount(world), share: 100, note: worldNote.value, color: 'normal' },
    {
      label: regionName.value,
      value: formatCount(region),
      share: percent(region, world),
      note: `${formatShare(percent(region, world))} of the world`,
      color: 'normal',
    },
    {
      label: props.countryName,
      value: formatCount(country),
      share: percent(country, world),
      note: `${formatShare(percent(country, world))} of the world · ${formatShare(percent(country, region))} of ${regionName.value}`,
      color: 'normal',
    },
  ];
});

const shares = computed(() =>
  props.comparison.data.map((point) => {
    const { country, region, world } = counts(point);
    return { startDate: point.startDate, region: percent(country, region), world: percent(country, world) };
  }),
);

const periods = computed(() =>
  shares.value.map((share) => ({
    key: share.startDate,
    label: DateTime.fromISO(share.startDate).toFormat(props.granularity === 'yearly' ? 'yyyy' : 'MMM yyyy'),
    regionShare: formatShare(share.region),
    worldShare: formatShare(share.world),
  })),
);

const chartData = computed<ChartData[]>(() =>
  shares.value.map((share) => ({
    key: share.startDate,
    values: [Number(share.region.toFixed(1)), Number(share.world.toFixed(1))],
  })),
);

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: `Share of ${regionName.value}`,
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    color: lfxColors.brand[500],
  },
  {
    name: 'Share of the world',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    color: lfxColors.neutral[700],
  },
]);

const chartConfig = computed(() => {
  const config = getLineAreaChartConfig(
    chartData.value,
    chartSeries.value,
    props.granularity,
    (value: number) => `${value}%`,
    undefined,
    1,
  );
  // Shares sit far below 100%, so start the axis at 0 instead of the default data-driven bounds.
  config.yAxis = { ...config.yAxis, min: 0, max: undefined };
  // The shared tooltip prints bare numbers; these values are percentages.
  config.tooltip = {
    ...config.tooltip,
    formatter: (paramsRaw: unknown) => {
      const params = (Array.isArray(paramsRaw) ? paramsRaw : [paramsRaw]) as {
        dataIndex: number;
        seriesName: string;
        value: number;
        color: string;
      }[];
      const period = periods.value[params[0]?.dataIndex ?? 0]?.label ?? '';
      const lines = params
        .map(
          (p) => `<div style="display: flex; justify-content: space-between; gap: 16px; min-width: 180px;
            font-size: 12px; color: ${lfxColors.neutral[900]};">
            <span><span style="display: inline-block; width: 8px; height: 8px; border-radius: 100%;
              margin-right: 4px; background-color: ${p.color};"></span>${p.seriesName}</span>
            <span style="font-weight: 500;">${formatShare(p.value)}</span>
          </div>`,
        )
        .join('');
      return `<div style="font-size: 12px; color: ${lfxColors.neutral[400]};">${period}</div>${lines}`;
    },
  };
  return config;
});
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountryComparison',
};
</script>
