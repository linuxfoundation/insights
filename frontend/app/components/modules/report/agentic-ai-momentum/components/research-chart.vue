<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-4">
      <lfx-tabs
        v-model="countMode"
        :tabs="countModeTabs"
        width-type="inline"
      />
      <lfx-tabs
        v-model="displayMode"
        :tabs="displayTabs"
        width-type="inline"
      />
    </div>

    <div v-if="isLoading">
      <div class="flex flex-col gap-4 h-[280px] sm:h-[350px] pt-4">
        <lfx-skeleton
          height="100%"
          width="100%"
        />
      </div>
    </div>

    <div
      v-else-if="chartData.length === 0"
      class="flex items-center justify-center h-[280px] sm:h-[350px]"
    >
      <div class="text-neutral-500">No research data available.</div>
    </div>

    <div
      v-else
      class="h-[280px] sm:h-[350px]"
    >
      <client-only>
        <lfx-chart
          :config="chartConfig"
          :animation="true"
        />
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { merge } from 'lodash-es';
import { getResearchTopicColor, getResearchTopicLabel } from '../config/layer-colors';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { ResearchPapersData } from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  data: ResearchPapersData[];
  isLoading: boolean;
}>();

const displayTabs = [
  { value: 'absolute', label: 'Absolute' },
  { value: 'percentage', label: 'Percentage' },
];
const displayMode = ref('absolute');
const showPercentage = computed(() => displayMode.value === 'percentage');

const countModeTabs = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'cumulative', label: 'Cumulative' },
];
const countMode = ref('monthly');
const showCumulative = computed(() => countMode.value === 'cumulative');

// Get unique topics (sorted by total papers)
const uniqueTopics = computed(() => {
  const topicTotals = new Map<string, number>();
  props.data.forEach((item) => {
    if (item.month === 'pre_window') return;
    const current = topicTotals.get(item.topic) || 0;
    topicTotals.set(item.topic, current + item.paper_count);
  });

  return Array.from(topicTotals.entries())
    .sort((a, b) => a[1] - b[1]) // Ascending so largest is on top of stack
    .map(([topic]) => topic);
});

// Get unique months (excluding pre_window)
const uniqueMonths = computed(() => {
  const months = new Set<string>();
  props.data.forEach((item) => {
    if (item.month !== 'pre_window') {
      months.add(item.month);
    }
  });
  return Array.from(months).sort();
});

// Precompute running cumulative sums per topic (sorted month order)
const cumulativeCounts = computed(() => {
  const result = new Map<string, Map<string, number>>();
  uniqueTopics.value.forEach((topic) => {
    const topicMap = new Map<string, number>();
    let running = 0;
    uniqueMonths.value.forEach((month) => {
      const dataPoint = props.data.find((item) => item.month === month && item.topic === topic);
      running += dataPoint?.paper_count ?? 0;
      topicMap.set(month, running);
    });
    result.set(topic, topicMap);
  });
  return result;
});

// Build chart data
const chartData = computed<ChartData[]>(() =>
  uniqueMonths.value.map((month) => {
    const rawValues = uniqueTopics.value.map((topic) => {
      if (showCumulative.value) {
        return cumulativeCounts.value.get(topic)?.get(month) ?? 0;
      }
      const dataPoint = props.data.find((item) => item.month === month && item.topic === topic);
      return dataPoint?.paper_count ?? 0;
    });

    if (showPercentage.value) {
      const total = rawValues.reduce((sum, val) => sum + val, 0);
      const percentageValues =
        total > 0 ? rawValues.map((val) => parseFloat(((val / total) * 100).toFixed(1))) : rawValues.map(() => 0);
      return {
        key: month,
        values: percentageValues,
      };
    }

    return {
      key: month,
      values: rawValues,
    };
  }),
);

// Build chart series
const chartSeries = computed<ChartSeries[]>(() =>
  uniqueTopics.value.map((topic, index) => ({
    name: getResearchTopicLabel(topic),
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: index,
    color: getResearchTopicColor(topic),
  })),
);

// Chart configuration
const chartConfig = computed(() => {
  const baseConfig = getBarChartConfigStacked(chartData.value, chartSeries.value, 'monthly');

  return merge({}, baseConfig, {
    grid: {
      top: '5%',
      left: '8%',
      right: '5%',
      bottom: '25%',
    },
    media: [],
    legend: {
      show: true,
      bottom: 0,
      left: 'center',
      type: 'plain',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      icon: 'roundRect',
      textStyle: {
        fontSize: 11,
        color: lfxColors.neutral[700],
      },
    },
    yAxis: showPercentage.value
      ? {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            fontSize: '12px',
            fontWeight: 'normal',
            color: lfxColors.neutral[400],
            formatter: (value: number) => `${value}%`,
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: lfxColors.neutral[200],
            },
          },
        }
      : {
          type: 'value',
          min: 0,
          axisLabel: {
            fontSize: '12px',
            fontWeight: 'normal',
            color: lfxColors.neutral[400],
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: lfxColors.neutral[200],
            },
          },
        },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (paramsRaw: { seriesName: string; value: number; color: string }[]) => {
        const params = Array.isArray(paramsRaw) ? paramsRaw : [paramsRaw];
        const items = params
          .filter((p) => p.value > 0)
          .sort((a, b) => b.value - a.value)
          .map(
            (p) => `
            <div style="display: flex; flex-direction: row; align-items: center;
              justify-content: space-between; min-width: 220px; font-weight: 400;
              font-size: 12px; color: ${lfxColors.neutral[900]};">
              <span style="font-weight: 400; font-size: 12px; margin-right: 10px;">
                <span style="background-color: ${p.color}; display: inline-block;
                  border-radius: 2px; height: 8px; width: 8px; margin-right: 4px;"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight: 500; font-size: 12px;">
                ${showPercentage.value ? `${p.value}%` : formatNumber(p.value)}
              </span>
            </div>`,
          )
          .join('');
        return items;
      },
    },
    series: (baseConfig.series as unknown[])?.map((s: unknown, index: number) => {
      const topic = uniqueTopics.value[index];
      const color = getResearchTopicColor(topic);
      return {
        ...(s as Record<string, unknown>),
        stack: 'research',
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color,
          borderRadius: [2, 2, 2, 2],
        },
      };
    }),
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticResearchChart',
};
</script>
