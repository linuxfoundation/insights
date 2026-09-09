<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 05 "Availability of each signal" component for the Health Score Coverage report
  (IN-1290, epic IN-1276). Not yet wired into health-score-coverage-report.vue - see
  health-score-coverage-signal-availability.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">05 · Availability</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Availability of each signal
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        Share of tracked repositories where each signal can be measured. A signal counts only if the data is both
        present and recent.
      </p>

      <div v-if="isLoading">
        <div class="h-[420px]">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[420px]"
      >
        <p class="text-neutral-500">No signal availability data available.</p>
      </div>

      <div
        v-else
        class="h-[420px]"
      >
        <client-only>
          <lfx-chart
            :config="chartConfig"
            :animation="true"
          />
        </client-only>
      </div>

      <p class="text-xs text-neutral-400">Signal availability · all tracked repositories</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { merge } from 'lodash-es';
import { fetchHealthScoreCoverageSignalAvailabilityQuery } from '../services/signal-availability.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { getHorizontalBarChartConfig, type HorizontalBarData } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  HealthScoreCoverageScope,
  HealthScoreCoverageSignalAvailabilityCount,
} from '~~/types/report/health-score-coverage-signal-availability.types';

// Display names per the design copy, keyed by the pipe's `signal_key`. Duplicated here rather than
// imported from config/signals.ts because that shared file is created by IN-1285 and isn't ready
// for this widget to depend on yet - see the types file for the merge-order explanation.
const SIGNAL_LABELS: Record<string, string> = {
  commitActivity: 'Commit activity',
  responsiveness: 'Responsiveness',
  orgDiversity: 'Organizational diversity',
  prMerge: 'Pull request merge',
  busFactor: 'Bus factor',
  openVuln: 'Known vulnerabilities',
  issueResolution: 'Issue resolution',
  securityPractices: 'Security practices',
  dependencyHealth: 'Dependency health',
  scorecard: 'OpenSSF Scorecard',
  releaseCadence: 'Release cadence',
};

const displayLabel = (signalKey: string): string => SIGNAL_LABELS[signalKey] ?? signalKey;

// Fixed scope=all per the ticket - this widget has no scope toggle. `fetchSignalAvailabilityQuery`
// still takes a scope so the underlying fetcher/mapper support lf/other, reused by widget 06.
const scope = ref<HealthScoreCoverageScope>('all');

const { data, isLoading } = fetchHealthScoreCoverageSignalAvailabilityQuery(computed(() => scope.value));

const signals = computed<HealthScoreCoverageSignalAvailabilityCount[]>(() => data.value?.signals ?? []);

const isEmpty = computed(() => !isLoading.value && signals.value.length === 0);

const round1 = (value: number): number => Math.round(value * 10) / 10;

interface SignalAvailabilityTooltipParam {
  dataIndex: number;
  value: number;
}

// Single-series horizontal bar chart, built on top of the shared getHorizontalBarChartConfig
// helper per the report's chart-config conventions - matches how
// report/agentic-ai-momentum/components/research-chart.vue builds its own chart config inline
// rather than in a separate .ts module.
const chartConfig = computed<ECOption>(() => {
  const chartData: HorizontalBarData[] = signals.value.map((signal) => ({
    category: displayLabel(signal.signalKey),
    value: round1(signal.availablePct),
  }));

  const baseConfig = getHorizontalBarChartConfig(chartData, lfxColors.brand[500]);

  return merge({}, baseConfig, {
    xAxis: {
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    tooltip: {
      formatter: (params: unknown) => {
        const paramArray = params as SignalAvailabilityTooltipParam[];
        if (!paramArray || paramArray.length === 0) return '';
        const param = paramArray[0];
        const signal = signals.value[param.dataIndex];
        if (!signal) return '';
        return `${displayLabel(signal.signalKey)}: ${param.value}% (${formatNumber(signal.reposAvailable)})`;
      },
    },
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageSignalAvailability',
};
</script>
