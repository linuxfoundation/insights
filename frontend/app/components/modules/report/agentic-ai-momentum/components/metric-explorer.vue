<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <!-- Axis selectors -->
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <div class="flex items-center gap-2">
        <span class="text-body-2 text-neutral-600">X-Axis:</span>
        <lfx-dropdown-select
          v-model="xAxisMetric"
          placement="bottom-start"
          width="12rem"
        >
          <template #trigger="{ selectedOption }">
            <lfx-dropdown-selector class="whitespace-nowrap !text-sm">
              <span>{{ selectedOption?.label }}</span>
            </lfx-dropdown-selector>
          </template>
          <lfx-dropdown-item
            v-for="option of metricOptions"
            :key="option.key"
            :value="option.key"
            :label="option.label"
            :checkmark-before="true"
          />
        </lfx-dropdown-select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-body-2 text-neutral-600">Y-Axis:</span>
        <lfx-dropdown-select
          v-model="yAxisMetric"
          placement="bottom-start"
          width="12rem"
        >
          <template #trigger="{ selectedOption }">
            <lfx-dropdown-selector class="whitespace-nowrap !text-sm">
              <span>{{ selectedOption?.label }}</span>
            </lfx-dropdown-selector>
          </template>
          <lfx-dropdown-item
            v-for="option of metricOptions"
            :key="option.key"
            :value="option.key"
            :label="option.label"
            :checkmark-before="true"
          />
        </lfx-dropdown-select>
      </div>
    </div>

    <div v-if="isLoading">
      <div class="flex flex-col gap-4 h-[350px] sm:h-[400px] pt-4">
        <lfx-skeleton
          height="100%"
          width="100%"
        />
      </div>
    </div>

    <div
      v-else-if="scatterData.length === 0"
      class="flex items-center justify-center h-[350px] sm:h-[400px]"
    >
      <div class="text-neutral-500">No data available for selected metrics.</div>
    </div>

    <div
      v-else
      class="h-[350px] sm:h-[400px]"
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
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  AgenticProject,
  StargazersData,
  ForkData,
  ContributorData,
  PackageDownloadsData,
  PullRequestMergeRateData,
  MetricKey,
  MetricOption,
} from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  projectsData: AgenticProject[];
  stargazersData: StargazersData[];
  forksData: ForkData[];
  contributorsData: ContributorData[];
  downloadsData: PackageDownloadsData[];
  mergeRateData: PullRequestMergeRateData[];
  isLoading: boolean;
}>();

const metricOptions: MetricOption[] = [
  { key: 'stars', label: 'Stars', format: 'number' },
  { key: 'forks', label: 'Forks', format: 'number' },
  { key: 'contributors', label: 'Contributors', format: 'number' },
  { key: 'downloads', label: 'Downloads', format: 'number' },
  { key: 'mergeRate', label: 'Merge Rate', format: 'percent' },
];

const xAxisMetric = ref<MetricKey>('stars');
const yAxisMetric = ref<MetricKey>('contributors');

// Helper to get latest value from time series data
function getLatestValue<T extends { month: string }>(data: T[], repo: string, valueKey: keyof T): number | null {
  const repoData = data.filter((d) => d.repo === repo).sort((a, b) => b.month.localeCompare(a.month));
  if (repoData.length === 0) return null;
  return repoData[0][valueKey] as number;
}

// Get metric value for a project
function getMetricValue(project: AgenticProject, metric: MetricKey): number | null {
  const repo = project.github_url;
  if (!repo) return null;

  switch (metric) {
    case 'stars':
      return getLatestValue(props.stargazersData, repo, 'cumulative_stars');
    case 'forks':
      return getLatestValue(props.forksData, repo, 'cumulative_forks');
    case 'contributors':
      return getLatestValue(props.contributorsData, repo, 'cumulative_contributors');
    case 'downloads': {
      const downloadsFiltered = props.downloadsData.filter((d) => d.repo === repo);
      if (downloadsFiltered.length === 0) return null;
      const latestMonth = downloadsFiltered.sort((a, b) => b.month.localeCompare(a.month))[0]?.month;
      return downloadsFiltered.filter((d) => d.month === latestMonth).reduce((sum, d) => sum + d.download_counts, 0);
    }
    case 'mergeRate':
      return getLatestValue(props.mergeRateData, repo, 'pr_merge_rate');
    default:
      return null;
  }
}

// Build scatter data
const scatterData = computed(() => {
  const data: Array<{
    name: string;
    layer: string;
    x: number;
    y: number;
    githubUrl: string | null;
  }> = [];

  props.projectsData.forEach((project) => {
    const xValue = getMetricValue(project, xAxisMetric.value);
    const yValue = getMetricValue(project, yAxisMetric.value);

    if (xValue !== null && yValue !== null) {
      data.push({
        name: project.name,
        layer: project.layer,
        x: xValue,
        y: yValue,
        githubUrl: project.github_url,
      });
    }
  });

  return data;
});

// Get layer color in hex for chart
const layerHexColors: Record<string, string> = {
  'Protocols & Standards': '#3B82F6',
  'Orchestration & Multi-Agent': '#8B5CF6',
  'Personal & Coding Agents': '#10B981',
  'Computer Use & Browser Agents': '#F97316',
  'MCP Infrastructure': '#06B6D4',
  'Memory & Retrieval': '#6366F1',
  'Tool Use & Integration': '#EC4899',
  'Evaluation & Observability': '#EAB308',
  'Agent-Optimized Models': '#EF4444',
  'Safety & Guardrails': '#059669',
  'Developer Tooling & SDKs': '#64748B',
  'Agent Infrastructure': '#7C3AED',
  'Voice & Multimodal Agents': '#F59E0B',
  'Research & Vertical Agents': '#14B8A6',
};

function getLayerHexColor(layer: string): string {
  return layerHexColors[layer] || '#6B7280';
}

// Format axis label
function formatAxisValue(value: number, metric: MetricKey): string {
  const option = metricOptions.find((o) => o.key === metric);
  if (option?.format === 'percent') {
    return `${(value * 100).toFixed(0)}%`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return formatNumber(value);
}

// Get axis label
function getAxisLabel(metric: MetricKey): string {
  return metricOptions.find((o) => o.key === metric)?.label || metric;
}

// Chart configuration
const chartConfig = computed<ECOption>(() => {
  // Group data by layer for series
  const layerGroups = new Map<string, Array<[number, number, string]>>();

  scatterData.value.forEach((point) => {
    if (!layerGroups.has(point.layer)) {
      layerGroups.set(point.layer, []);
    }
    layerGroups.get(point.layer)?.push([point.x, point.y, point.name]);
  });

  const series = Array.from(layerGroups.entries()).map(([layer, points]) => ({
    name: layer,
    type: 'scatter',
    data: points,
    symbolSize: 12,
    itemStyle: {
      color: getLayerHexColor(layer),
      opacity: 0.8,
    },
    emphasis: {
      scale: 1.5,
      itemStyle: {
        opacity: 1,
      },
    },
  }));

  return {
    grid: {
      top: '5%',
      left: '10%',
      right: '5%',
      bottom: '25%',
      containLabel: true,
    },
    legend: {
      show: true,
      bottom: 0,
      left: 'center',
      type: 'plain',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: {
        fontSize: 10,
        color: lfxColors.neutral[600],
      },
    },
    xAxis: {
      type: 'value',
      name: getAxisLabel(xAxisMetric.value),
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 12,
        color: lfxColors.neutral[700],
      },
      axisLabel: {
        fontSize: 11,
        color: lfxColors.neutral[400],
        formatter: (value: number) => formatAxisValue(value, xAxisMetric.value),
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: lfxColors.neutral[200],
        },
      },
    },
    yAxis: {
      type: 'value',
      name: getAxisLabel(yAxisMetric.value),
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        fontSize: 12,
        color: lfxColors.neutral[700],
      },
      axisLabel: {
        fontSize: 11,
        color: lfxColors.neutral[400],
        formatter: (value: number) => formatAxisValue(value, yAxisMetric.value),
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: lfxColors.neutral[200],
        },
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { data: [number, number, string]; seriesName: string; color: string }) => {
        const [xVal, yVal, name] = params.data;
        return `
          <div style="font-size: 12px; color: ${lfxColors.neutral[900]};">
            <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span style="background-color: ${params.color}; display: inline-block;
                border-radius: 100%; height: 8px; width: 8px;"></span>
              ${params.seriesName}
            </div>
            <div>${getAxisLabel(xAxisMetric.value)}: ${formatAxisValue(xVal, xAxisMetric.value)}</div>
            <div>${getAxisLabel(yAxisMetric.value)}: ${formatAxisValue(yVal, yAxisMetric.value)}</div>
          </div>
        `;
      },
    },
    series,
  };
});
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticMetricExplorer',
};
</script>
