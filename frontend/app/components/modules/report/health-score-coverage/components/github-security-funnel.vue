<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!--
  Standalone widget 08 "Security coverage on GitHub-hosted repositories" component for the Health
  Score Coverage report (IN-1293, epic IN-1276). Not yet wired into health-score-coverage-report.vue
  - see health-score-coverage-github-security.types.ts for why.
-->
<template>
  <lfx-card class="p-4 md:p-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Availability</p>
        <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900">
          Security coverage on GitHub-hosted repositories
        </h3>
      </div>

      <p class="text-body-2 text-neutral-500">
        Two of the four security signals, OpenSSF Scorecard and security practices, exist only for repositories hosted
        on GitHub. Every repository below is GitHub-hosted, so this is the furthest security scoring can currently
        reach, and how much of that reach we have covered.
      </p>

      <div v-if="isLoading">
        <div class="h-[320px]">
          <lfx-skeleton
            height="100%"
            width="100%"
          />
        </div>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex items-center justify-center h-[320px]"
      >
        <p class="text-neutral-500">No security coverage data available.</p>
      </div>

      <div
        v-else
        class="h-[320px]"
      >
        <client-only>
          <lfx-chart
            :config="chartConfig"
            :animation="true"
          />
        </client-only>
      </div>

      <p
        v-if="!isLoading && !isEmpty"
        class="text-xs text-neutral-400"
      >
        A further {{ formatNumber(lfNonGithub) }} repositories sit on Gerrit, GitLab and elsewhere. There, these two
        signals are absent by design rather than simply unscanned.
      </p>

      <p class="text-xs text-neutral-400">GitHub-hosted repositories · by stage</p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { fetchHealthScoreCoverageGithubSecurityQuery } from '../services/github-security.query';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { HealthScoreCoverageGithubSecurityStageCount } from '~~/types/report/health-score-coverage-github-security.types';

const { data, isLoading, suspense } = fetchHealthScoreCoverageGithubSecurityQuery();

onServerPrefetch(async () => {
  await suspense();
});

const stages = computed<HealthScoreCoverageGithubSecurityStageCount[]>(() => data.value?.stages ?? []);

const lfNonGithub = computed(() => data.value?.lfNonGithub ?? 0);

const isEmpty = computed(() => !isLoading.value && stages.value.length === 0);

interface GithubSecurityTooltipParam {
  seriesName: string;
  dataIndex: number;
}

// Vertical grouped bar chart: this widget was a table (<lfx-table>), not a horizontal bar chart as
// the design feedback assumed - re-verified directly against this file before converting. Stage on
// the x-axis, Linux Foundation vs other tracked projects as two grouped bar series, using the
// report-wide LF-vs-non-LF color convention (brand blue / violet). Built inline rather than through
// bar.chart.ts's date-oriented helpers, same reasoning as the other categorical-axis widgets in
// this report.
const chartConfig = computed<ECOption>(() => {
  // Design feedback: the "Tracked in Insights" stage is always 100% by definition (it's the
  // funnel's own denominator), so it added a flat, uninformative bar pair - drop it from the
  // chart only, keeping the full 4-stage funnel in `stages`/`isEmpty` for the data layer and the
  // footnote below.
  const rows = stages.value.filter((stage) => stage.stage !== 'tracked');

  return {
    grid: {
      left: 48,
      right: '5%',
      top: 16,
      bottom: 96,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: rows.map((stage) => stage.label),
      axisLabel: {
        fontSize: 11,
        fontWeight: 500,
        color: lfxColors.neutral[900],
        interval: 0,
        rotate: 20,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        fontSize: 10,
        fontWeight: 'normal',
        color: lfxColors.neutral[400],
        formatter: '{value}%',
      },
      axisLine: { show: false },
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: lfxColors.neutral[200],
        },
      },
      axisTick: { show: false },
    },
    legend: {
      bottom: 0,
      data: ['Linux Foundation', 'Other projects'],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const paramArray = params as GithubSecurityTooltipParam[];
        if (!paramArray || paramArray.length === 0) return '';
        return paramArray
          .map((param) => {
            const stage = rows[param.dataIndex];
            if (!stage) return '';
            const isLf = param.seriesName === 'Linux Foundation';
            const count = isLf ? stage.lf : stage.other;
            const sharePct = isLf ? stage.lfSharePct : stage.otherSharePct;
            return `${param.seriesName}: ${formatNumber(count)} (${sharePct}%)`;
          })
          .join('<br/>');
      },
    },
    series: [
      {
        name: 'Linux Foundation',
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map((stage) => stage.lfSharePct),
        itemStyle: { color: lfxColors.brand[500], borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Other projects',
        type: 'bar',
        barMaxWidth: 32,
        data: rows.map((stage) => stage.otherSharePct),
        itemStyle: { color: lfxColors.violet[500], borderRadius: [10, 10, 0, 0] },
      },
    ],
  };
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageGithubSecurityFunnel',
};
</script>
