<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div class="h-[280px] sm:h-[400px]">
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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { merge } from 'lodash-es';
import type { AiToolTimeSeriesDataPoint, PeriodTotalCommits } from '../config/ai-code-tracker-mock-data';
import { getAiToolColor } from '../config/ai-tools-colors';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = defineProps<{
  data: AiToolTimeSeriesDataPoint[];
  periodTotals: PeriodTotalCommits[];
  granularity: string;
  showPercentage?: boolean;
}>();

const isMobile = ref(false);

function updateIsMobile() {
  isMobile.value = window.innerWidth < 640;
}

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile);
});

const uniqueTools = computed(() => {
  const toolMap = new Map<string, { toolKey: string; toolName: string }>();
  props.data.forEach((item) => {
    if (!toolMap.has(item.toolKey)) {
      toolMap.set(item.toolKey, {
        toolKey: item.toolKey,
        toolName: item.toolName,
      });
    }
  });
  return Array.from(toolMap.values());
});

const uniqueDates = computed(() => {
  const dates = new Set<string>();
  props.data.forEach((item) => dates.add(item.startDate));
  return Array.from(dates).sort();
});

const chartData = computed<ChartData[]>(() =>
  uniqueDates.value.map((date) => {
    const rawValues = uniqueTools.value.map((tool) => {
      const dataPoint = props.data.find((item) => item.startDate === date && item.toolKey === tool.toolKey);
      return dataPoint?.commitCount ?? 0;
    });

    if (props.showPercentage) {
      // Get total commits for this period (not just AI commits)
      const periodTotal = props.periodTotals.find((p) => p.startDate === date);
      const totalCommits = periodTotal?.totalCommits ?? 0;
      const percentageValues =
        totalCommits > 0
          ? rawValues.map((val) => Math.round((val / totalCommits) * 1000) / 10)
          : rawValues.map(() => 0);
      return {
        key: date,
        values: percentageValues,
      };
    }

    return {
      key: date,
      values: rawValues,
    };
  }),
);

const chartSeries = computed<ChartSeries[]>(() =>
  uniqueTools.value.map((tool, index) => ({
    name: tool.toolName,
    type: 'line',
    yAxisIndex: 0,
    dataIndex: index,
    color: getAiToolColor(tool.toolKey),
  })),
);

const chartConfig = computed(() => {
  const baseConfig = getLineAreaChartConfig(chartData.value, chartSeries.value, props.granularity);

  return merge({}, baseConfig, {
    grid: {
      top: '5%',
      left: '8%',
      right: '18%',
      bottom: '12%',
    },
    media: [
      {
        query: { maxWidth: 640 },
        option: {
          grid: {
            right: '3%',
          },
        },
      },
    ],
    legend: {
      show: false,
    },
    yAxis: props.showPercentage
      ? {
          type: 'value',
          min: 0,
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
      : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      formatter: (paramsRaw: { seriesName: string; value: number; color: string }[]) => {
        const params = Array.isArray(paramsRaw) ? paramsRaw : [paramsRaw];
        const items = params
          .filter((p) => p.value > 0)
          .sort((a, b) => b.value - a.value)
          .map(
            (p) => `
            <div style="display: flex; flex-direction: row; align-items: center;
              justify-content: space-between; min-width: 200px; font-weight: 400;
              font-size: 12px; color: ${lfxColors.neutral[900]};">
              <span style="font-weight: 400; font-size: 12px; margin-right: 10px;">
                <span style="background-color: ${p.color}; display: inline-block;
                  border-radius: 100%; height: 8px; width: 8px; margin-right: 4px;"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight: 500; font-size: 12px;">
                ${props.showPercentage ? `${p.value}%` : formatNumber(p.value)}
              </span>
            </div>`,
          )
          .join('');
        return items;
      },
    },
    series: (baseConfig.series as unknown[])?.map((s: unknown, index: number) => {
      const tool = uniqueTools.value[index];
      const toolKey = tool?.toolKey || 'other';
      const color = getAiToolColor(toolKey);
      return {
        ...(s as Record<string, unknown>),
        stack: 'ai-tools',
        areaStyle: {
          opacity: 1,
          color,
        },
        lineStyle: {
          width: 0,
        },
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color,
        },
        endLabel: {
          show: !isMobile.value,
          formatter: tool?.toolName || '',
          fontSize: 11,
          color: lfxColors.neutral[700],
          distance: 8,
          overflow: 'truncate',
          ellipsis: '...',
        },
        labelLayout: {
          hideOverlap: true,
        },
      };
    }),
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxAiCommitsTimeChart',
};
</script>
