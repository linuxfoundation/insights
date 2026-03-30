<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <!-- Controls -->
    <div class="flex flex-col gap-3 mb-4">
      <!-- Row 1: four axis controls -->
      <div class="flex flex-wrap gap-x-3 gap-y-3 items-start">
        <!-- X Axis -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-neutral-500">X Axis</span>
          <lfx-popover
            v-model:visibility="showXPicker"
            placement="bottom-start"
            :spacing="6"
          >
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-1 hover:bg-neutral-50 whitespace-nowrap"
            >
              {{ getAxisLabel(xAxisMetric) }}
              <lfx-icon
                :name="showXPicker ? 'chevron-up' : 'chevron-down'"
                :size="12"
              />
            </button>
            <template #content>
              <metric-picker-panel
                :config="METRIC_CONFIG"
                :groups="METRIC_GROUPS"
                :selected="xAxisMetric"
                @select="
                  (key) => {
                    xAxisMetric = key;
                    showXPicker = false;
                  }
                "
              />
            </template>
          </lfx-popover>
          <lfx-tabs
            v-model="xScaleMode"
            :tabs="scaleTabs"
            width-type="inline"
          />
        </div>

        <!-- Y Axis -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-neutral-500">Y Axis</span>
          <lfx-popover
            v-model:visibility="showYPicker"
            placement="bottom-start"
            :spacing="6"
          >
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-1 hover:bg-neutral-50 whitespace-nowrap"
            >
              {{ getAxisLabel(yAxisMetric) }}
              <lfx-icon
                :name="showYPicker ? 'chevron-up' : 'chevron-down'"
                :size="12"
              />
            </button>
            <template #content>
              <metric-picker-panel
                :config="METRIC_CONFIG"
                :groups="METRIC_GROUPS"
                :selected="yAxisMetric"
                @select="
                  (key) => {
                    yAxisMetric = key;
                    showYPicker = false;
                  }
                "
              />
            </template>
          </lfx-popover>
          <lfx-tabs
            v-model="yScaleMode"
            :tabs="scaleTabs"
            width-type="inline"
          />
        </div>

        <!-- Bubble Size (Z axis) -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-neutral-500">Bubble Size</span>
          <lfx-popover
            v-model:visibility="showZPicker"
            placement="bottom-start"
            :spacing="6"
          >
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-1 hover:bg-neutral-50 whitespace-nowrap"
            >
              {{ zAxisMetric === 'none' ? 'None' : getAxisLabel(zAxisMetric as MetricKey) }}
              <lfx-icon
                :name="showZPicker ? 'chevron-up' : 'chevron-down'"
                :size="12"
              />
            </button>
            <template #content>
              <metric-picker-panel
                :config="METRIC_CONFIG"
                :groups="METRIC_GROUPS"
                :selected="zAxisMetric === 'none' ? null : (zAxisMetric as MetricKey)"
                :show-none="true"
                @select="
                  (key) => {
                    zAxisMetric = key;
                    showZPicker = false;
                  }
                "
                @select-none="
                  () => {
                    zAxisMetric = 'none';
                    showZPicker = false;
                  }
                "
              />
            </template>
          </lfx-popover>
        </div>

        <!-- Trend Line -->
        <div class="flex flex-col gap-1 w-[8rem]">
          <span class="text-xs font-medium text-neutral-500">Trend Line</span>
          <lfx-tabs
            v-model="trendLineMode"
            :tabs="trendLineTabs"
            width-type="inline"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading">
      <div class="flex flex-col gap-4 w-full aspect-[4/3] max-h-[500px] pt-4">
        <lfx-skeleton
          height="100%"
          width="100%"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="scatterData.length === 0"
      class="flex items-center justify-center w-full aspect-[4/3] max-h-[500px]"
    >
      <div class="text-neutral-500">No data available for selected metrics.</div>
    </div>

    <!-- Chart + Z legend overlay -->
    <div
      v-else
      class="relative w-full aspect-[4/3] max-h-[500px]"
    >
      <client-only>
        <lfx-chart
          :config="chartConfig"
          :animation="true"
        />
      </client-only>

      <!-- Z / bubble size legend — absolute top-right of plot area -->
      <div
        v-if="zAxisMetric !== 'none' && zLegendEntries.length"
        class="absolute top-4 right-8 flex flex-col gap-1.5 bg-white/90 rounded px-2.5 py-2 shadow-sm border border-neutral-100"
      >
        <span class="text-xs font-medium text-neutral-500">{{ getAxisLabel(zAxisMetric as MetricKey) }}</span>
        <div
          v-for="(entry, i) in zLegendEntries"
          :key="i"
          class="flex items-center gap-2"
        >
          <div
            class="rounded-full bg-neutral-400 opacity-60 flex-shrink-0"
            :style="{ width: entry.size + 'px', height: entry.size + 'px' }"
          />
          <span class="text-xs text-neutral-500">{{ formatAxisValue(entry.value, zAxisMetric as MetricKey) }}</span>
        </div>
      </div>
    </div>

    <!-- Custom layer legend (replaces ECharts canvas legend) -->
    <div
      v-if="!isLoading && scatterData.length > 0"
      class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-neutral-100"
    >
      <!-- All / None filter (same LfxTabs style as other controls) -->
      <lfx-tabs
        v-model="layerFilterMode"
        :tabs="layerFilterTabs"
        width-type="inline"
      />
      <!-- Individual layer toggles -->
      <button
        v-for="layer in allLayerNames"
        :key="layer"
        type="button"
        class="flex items-center gap-1.5 transition-opacity"
        :class="activeLayers.has(layer) ? 'opacity-100' : 'opacity-30'"
        @click="toggleLayer(layer)"
      >
        <div
          class="rounded-full flex-shrink-0"
          :style="{ width: '15px', height: '15px', backgroundColor: getLayerHexColor(layer) }"
        />
        <span class="text-sm text-neutral-700 whitespace-nowrap">{{ layer }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, h, type FunctionalComponent } from 'vue';
import { getLayerHexColor } from '../config/layer-colors';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  AgenticProject,
  StargazersData,
  ForkData,
  CommitCountData,
  ContributorData,
  NewContributors90dData,
  PackageDownloadsData,
  PullRequestMergeRateData,
  IssueTimeToCloseData,
  IssueTimeToFirstResponseData,
  IssueNoResponseShareData,
  PullRequestTimeToResolveData,
  VulnerabilitiesData,
  CocomoValueData,
  GitHubReleasesData,
  DockerHubPullsData,
  DependentReposData,
  DependentPackagesData,
  MetricKey,
  MetricOption,
  MetricGroup,
} from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  projectsData: AgenticProject[];
  stargazersData: StargazersData[];
  forksData: ForkData[];
  commitsData: CommitCountData[];
  contributorsData: ContributorData[];
  newContributors90dData: NewContributors90dData[];
  downloadsData: PackageDownloadsData[];
  mergeRateData: PullRequestMergeRateData[];
  timeToCloseData: IssueTimeToCloseData[];
  issueResponseTimeData: IssueTimeToFirstResponseData[];
  noResponseShareData: IssueNoResponseShareData[];
  prTimeToResolveData: PullRequestTimeToResolveData[];
  totalVulnerabilitiesData: VulnerabilitiesData[];
  cocomoData: CocomoValueData[];
  githubReleasesData: GitHubReleasesData[];
  dockerPullsData: DockerHubPullsData[];
  dependentReposData: DependentReposData[];
  dependentPackagesData: DependentPackagesData[];
  isLoading: boolean;
}>();

// ── Metric config (mirrors leaderboard COLUMN_CONFIG groups) ──────────────────

const METRIC_GROUPS: MetricGroup[] = ['Growth', 'Community', 'Health', 'Value'];

const METRIC_CONFIG: MetricOption[] = [
  // Growth
  { key: 'stars', label: 'Stars', format: 'number', group: 'Growth' },
  { key: 'forks', label: 'Forks', format: 'number', group: 'Growth' },
  { key: 'downloads', label: 'Downloads', format: 'number', group: 'Growth' },
  { key: 'dockerHubPulls', label: 'Docker Pulls', format: 'number', group: 'Growth' },
  { key: 'dependentRepositories', label: 'Dependent Repos', format: 'number', group: 'Growth' },
  { key: 'dependentPackages', label: 'Dependent Pkgs', format: 'number', group: 'Growth' },
  // Community
  { key: 'commits', label: 'Commits', format: 'number', group: 'Community' },
  { key: 'contributors', label: 'Contributors', format: 'number', group: 'Community' },
  { key: 'newContributors', label: 'New Contributors', format: 'number', group: 'Community' },
  { key: 'releases', label: 'Releases', format: 'number', group: 'Community' },
  // Health
  { key: 'mergeRate', label: 'Merge Rate', format: 'percent', group: 'Health' },
  { key: 'prTimeToResolve', label: 'PR Resolve Time', format: 'days', group: 'Health' },
  { key: 'timeToClose', label: 'Time to Close', format: 'days', group: 'Health' },
  { key: 'issueResponseTime', label: 'Issue Response', format: 'days', group: 'Health' },
  { key: 'noResponseIssues', label: 'No-Response Issues', format: 'percent', group: 'Health' },
  { key: 'totalVulnerabilities', label: 'Vulnerabilities', format: 'number', group: 'Health' },
  // Value
  { key: 'cocomoValue', label: 'COCOMO Value', format: 'number', group: 'Value' },
];

// ── Inline panel component ────────────────────────────────────────────────────

/**
 * Renders the grouped metric picker panel, used by all three axis pickers.
 * Emits `select` (MetricKey) or `select-none` for the Z-axis "None" item.
 */
const MetricPickerPanel: FunctionalComponent<
  {
    config: MetricOption[];
    groups: MetricGroup[];
    selected: MetricKey | null;
    showNone?: boolean;
  },
  { select: [key: MetricKey]; 'select-none': [] }
> = (panelProps, { emit }) => {
  const { config, groups, selected, showNone = false } = panelProps;

  const groupSections = groups.map((group) => {
    const items = config.filter((c) => c.group === group);
    return h('div', { class: 'mb-4 last:mb-0' }, [
      h('p', { class: 'text-xs uppercase tracking-wide text-neutral-400 font-semibold mb-2' }, group),
      h(
        'div',
        { class: 'grid grid-cols-2 gap-x-4 gap-y-2' },
        items.map((opt) => {
          const isSelected = selected === opt.key;
          return h(
            'button',
            {
              key: opt.key,
              class:
                'flex items-center gap-2 cursor-pointer text-body-2 text-left select-none w-full ' +
                (isSelected ? 'text-primary-600 font-medium' : 'text-neutral-700 hover:text-neutral-900'),
              onClick: () => emit('select', opt.key),
            },
            [
              h(
                'span',
                {
                  class:
                    'w-3 h-3 rounded-sm flex-shrink-0 flex items-center justify-center border ' +
                    (isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-neutral-300'),
                },
                isSelected ? [h(LfxIcon, { name: 'check', type: 'regular', size: 8, class: 'text-white' })] : [],
              ),
              opt.label,
            ],
          );
        }),
      ),
    ]);
  });

  const noneItem = showNone
    ? h('div', { class: 'mb-4' }, [
        h(
          'button',
          {
            class:
              'flex items-center gap-2 cursor-pointer text-body-2 text-left select-none w-full ' +
              (selected === null ? 'text-primary-600 font-medium' : 'text-neutral-700 hover:text-neutral-900'),
            onClick: () => emit('select-none'),
          },
          [
            h(
              'span',
              {
                class:
                  'w-3 h-3 rounded-sm flex-shrink-0 flex items-center justify-center border ' +
                  (selected === null ? 'bg-primary-600 border-primary-600' : 'bg-white border-neutral-300'),
              },
              selected === null ? [h(LfxIcon, { name: 'check', type: 'regular', size: 8, class: 'text-white' })] : [],
            ),
            'None',
          ],
        ),
      ])
    : null;

  return h(
    'div',
    { class: 'bg-white border border-neutral-200 rounded shadow-lg p-4 w-[340px] max-h-[80vh] overflow-y-auto' },
    [noneItem, ...groupSections].filter(Boolean),
  );
};
MetricPickerPanel.props = ['config', 'groups', 'selected', 'showNone'];
MetricPickerPanel.emits = ['select', 'select-none'];

// ── Axis state ────────────────────────────────────────────────────────────────

const scaleTabs = [
  { value: 'linear', label: 'Linear' },
  { value: 'log', label: 'Log' },
];

const trendLineTabs = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
];

const MIN_SYMBOL_SIZE = 8;
const MAX_SYMBOL_SIZE = 40;

const xAxisMetric = ref<MetricKey>('stars');
const yAxisMetric = ref<MetricKey>('contributors');
const zAxisMetric = ref<MetricKey | 'none'>('none');
const xScaleMode = ref<'linear' | 'log'>('linear');
const yScaleMode = ref<'linear' | 'log'>('linear');
const trendLineMode = ref<'off' | 'on'>('off');
const activeLayers = ref<Set<string>>(new Set());

const showXPicker = ref(false);
const showYPicker = ref(false);
const showZPicker = ref(false);

const xLogScale = computed(() => xScaleMode.value === 'log');
const yLogScale = computed(() => yScaleMode.value === 'log');
const showTrendLine = computed(() => trendLineMode.value === 'on');

// ── Data helpers ──────────────────────────────────────────────────────────────

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
    case 'commits':
      return getLatestValue(props.commitsData, repo, 'cumulative_commits');
    case 'contributors':
      return getLatestValue(props.contributorsData, repo, 'cumulative_contributors');
    case 'newContributors':
      return getLatestValue(props.newContributors90dData, repo, 'new_contributors_90d_count');
    case 'downloads': {
      const downloadsFiltered = props.downloadsData.filter((d) => d.repo === repo);
      if (downloadsFiltered.length === 0) return null;
      const latestMonth = downloadsFiltered.sort((a, b) => b.month.localeCompare(a.month))[0]?.month;
      return downloadsFiltered.filter((d) => d.month === latestMonth).reduce((sum, d) => sum + d.download_counts, 0);
    }
    case 'dockerHubPulls':
      return getLatestValue(props.dockerPullsData, repo, 'docker_hub_pulls');
    case 'dependentRepositories':
      return getLatestValue(props.dependentReposData, repo, 'dependent_repos_count');
    case 'dependentPackages':
      return getLatestValue(props.dependentPackagesData, repo, 'dependent_packages_count');
    case 'mergeRate':
      return getLatestValue(props.mergeRateData, repo, 'pr_merge_rate');
    case 'timeToClose':
      return getLatestValue(props.timeToCloseData, repo, 'median_time_to_close_days');
    case 'issueResponseTime':
      return getLatestValue(props.issueResponseTimeData, repo, 'issue_time_to_first_response_avg_days');
    case 'noResponseIssues':
      return getLatestValue(props.noResponseShareData, repo, 'issue_share_no_response_30d');
    case 'prTimeToResolve':
      return getLatestValue(props.prTimeToResolveData, repo, 'median_time_to_resolve_days');
    case 'totalVulnerabilities':
      return getLatestValue(props.totalVulnerabilitiesData, repo, 'vulnerabilities_count');
    case 'cocomoValue':
      return getLatestValue(props.cocomoData, repo, 'estimated_cost_usd');
    case 'releases':
      return getLatestValue(props.githubReleasesData, repo, 'cumulative_releases');
    default:
      return null;
  }
}

// ── Scatter data ──────────────────────────────────────────────────────────────

const scatterData = computed(() => {
  const result: Array<{
    name: string;
    layer: string;
    x: number;
    y: number;
    z: number | null;
    githubUrl: string | null;
  }> = [];

  for (const project of props.projectsData) {
    const xValue = getMetricValue(project, xAxisMetric.value);
    const yValue = getMetricValue(project, yAxisMetric.value);
    if (xValue === null || yValue === null) continue;
    if (xLogScale.value && xValue <= 0) continue;
    if (yLogScale.value && yValue <= 0) continue;

    const zValue = zAxisMetric.value !== 'none' ? getMetricValue(project, zAxisMetric.value as MetricKey) : null;

    result.push({
      name: project.name,
      layer: project.layer,
      x: xValue,
      y: yValue,
      z: zValue,
      githubUrl: project.github_url,
    });
  }

  return result;
});

// Unique layer names in current data
const allLayerNames = computed(() => [...new Set(scatterData.value.map((p) => p.layer))]);

// Sync activeLayers: add new layers as they appear, preserve existing deselections.
watch(
  allLayerNames,
  (newLayers) => {
    const current = new Set(activeLayers.value);
    let changed = false;
    newLayers.forEach((layer) => {
      if (!current.has(layer)) {
        current.add(layer);
        changed = true;
      }
    });
    if (changed) activeLayers.value = current;
  },
  { immediate: true },
);

function selectAllLayers() {
  activeLayers.value = new Set(allLayerNames.value);
}
function clearAllLayers() {
  activeLayers.value = new Set();
}
function toggleLayer(layer: string) {
  const s = new Set(activeLayers.value);
  if (s.has(layer)) s.delete(layer);
  else s.add(layer);
  activeLayers.value = s;
}

const layerFilterTabs = [
  { value: 'all', label: 'All' },
  { value: 'none', label: 'None' },
];

const layerFilterMode = computed({
  get: (): string => {
    if (activeLayers.value.size === 0) return 'none';
    if (activeLayers.value.size >= allLayerNames.value.length) return 'all';
    return '';
  },
  set: (v: string) => {
    if (v === 'all') selectAllLayers();
    else if (v === 'none') clearAllLayers();
  },
});

// ── Z normalization ───────────────────────────────────────────────────────────

const zRange = computed(() => {
  if (zAxisMetric.value === 'none') return null;
  const vals = scatterData.value
    .filter((p) => activeLayers.value.has(p.layer) && p.z !== null)
    .map((p) => p.z as number);
  if (!vals.length) return null;
  return { min: Math.min(...vals), max: Math.max(...vals) };
});

function normalizeSize(value: number): number {
  const r = zRange.value;
  if (!r || r.max === r.min) return MIN_SYMBOL_SIZE;
  return MIN_SYMBOL_SIZE + Math.sqrt((value - r.min) / (r.max - r.min)) * (MAX_SYMBOL_SIZE - MIN_SYMBOL_SIZE);
}

const zLegendEntries = computed(() => {
  const r = zRange.value;
  if (!r || zAxisMetric.value === 'none') return [];
  return [r.min, (r.min + r.max) / 2, r.max].map((v) => ({
    value: v,
    size: normalizeSize(v),
  }));
});

// ── Axis label / value formatting ─────────────────────────────────────────────

function formatAxisValue(value: number, metric: MetricKey): string {
  const option = METRIC_CONFIG.find((o) => o.key === metric);
  if (option?.format === 'percent') {
    return `${(value * 100).toFixed(0)}%`;
  }
  if (option?.format === 'days') {
    return `${value.toFixed(0)}d`;
  }
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return formatNumber(value);
}

function getAxisLabel(metric: MetricKey): string {
  return METRIC_CONFIG.find((o) => o.key === metric)?.label || metric;
}

// ── Linear regression helpers ─────────────────────────────────────────────────

function linearRegression(points: [number, number][]) {
  const n = points.length;
  if (n < 3) return null;
  const sumX = points.reduce((s, p) => s + p[0], 0);
  const sumY = points.reduce((s, p) => s + p[1], 0);
  const sumXX = points.reduce((s, p) => s + p[0] * p[0], 0);
  const sumXY = points.reduce((s, p) => s + p[0] * p[1], 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const xMean = sumX / n;
  const ssX = points.reduce((s, p) => s + (p[0] - xMean) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p[1] - (slope * p[0] + intercept)) ** 2, 0);
  const mse = ssRes / Math.max(n - 2, 1);
  return { slope, intercept, mse, ssX, xMean, n };
}

type Regression = NonNullable<ReturnType<typeof linearRegression>>;

function predict(reg: Regression, x: number) {
  const yPred = reg.slope * x + reg.intercept;
  const se = Math.sqrt(reg.mse * (1 / reg.n + (x - reg.xMean) ** 2 / (reg.ssX || 1)));
  return { yPred, lower: yPred - 1.96 * se, upper: yPred + 1.96 * se };
}

function buildTrendSeries(visiblePoints: { x: number; y: number }[]) {
  if (visiblePoints.length < 3) return [];

  const tx = (v: number) => (xLogScale.value ? Math.log10(Math.max(v, 1e-10)) : v);
  const ty = (v: number) => (yLogScale.value ? Math.log10(Math.max(v, 1e-10)) : v);
  const uy = (v: number) => (yLogScale.value ? Math.pow(10, v) : v);

  const reg = linearRegression(visiblePoints.map((p) => [tx(p.x), ty(p.y)]));
  if (!reg) return [];

  const xs = visiblePoints.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const N = 60;

  const lineData: [number, number][] = [];

  for (let i = 0; i <= N; i++) {
    const x = xLogScale.value
      ? Math.pow(
          10,
          Math.log10(Math.max(xMin, 1e-10)) +
            (i / N) * (Math.log10(Math.max(xMax, 1e-10)) - Math.log10(Math.max(xMin, 1e-10))),
        )
      : xMin + (i / N) * (xMax - xMin);

    const { yPred } = predict(reg, tx(x));
    lineData.push([x, uy(yPred)]);
  }

  return [
    {
      name: '__trend',
      type: 'line',
      data: lineData,
      lineStyle: { color: '#6B7280', width: 1.5, type: 'dashed' },
      symbol: 'none',
      silent: true,
      legendHoverLink: false,
      z: 2,
    },
  ];
}

// ── Chart configuration ───────────────────────────────────────────────────────

const chartConfig = computed<ECOption>(() => {
  const layerGroups = new Map<string, Array<[number, number, string, number | null]>>();

  scatterData.value.forEach((point) => {
    if (!activeLayers.value.has(point.layer)) return;
    if (!layerGroups.has(point.layer)) layerGroups.set(point.layer, []);
    layerGroups.get(point.layer)!.push([point.x, point.y, point.name, point.z]);
  });

  const scatterSeries = Array.from(layerGroups.entries()).map(([layer, points]) => ({
    name: layer,
    type: 'scatter',
    data: points,
    symbolSize:
      zAxisMetric.value === 'none'
        ? 12
        : (data: [number, number, string, number | null]) =>
            data[3] !== null ? normalizeSize(data[3]) : MIN_SYMBOL_SIZE,
    itemStyle: {
      color: getLayerHexColor(layer),
      opacity: 0.8,
    },
    emphasis: {
      scale: 1.5,
      itemStyle: { opacity: 1 },
    },
  }));

  const visiblePoints = scatterData.value.filter((p) => activeLayers.value.has(p.layer));
  const trendSeries = showTrendLine.value ? buildTrendSeries(visiblePoints) : [];

  return {
    grid: {
      top: '5%',
      left: '10%',
      right: '5%',
      bottom: '8%',
      containLabel: true,
    },
    legend: { show: false },
    xAxis: {
      type: xLogScale.value ? 'log' : 'value',
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
      type: yLogScale.value ? 'log' : 'value',
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
      formatter: (params: { data: [number, number, string, number | null]; seriesName: string; color: string }) => {
        if (params.seriesName.startsWith('__')) return '';
        const [xVal, yVal, name, zVal] = params.data;
        let html = `
          <div style="font-size: 12px; color: ${lfxColors.neutral[900]};">
            <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span style="background-color: ${params.color}; display: inline-block;
                border-radius: 100%; height: 8px; width: 8px;"></span>
              ${params.seriesName}
            </div>
            <div>${getAxisLabel(xAxisMetric.value)}: ${formatAxisValue(xVal, xAxisMetric.value)}</div>
            <div>${getAxisLabel(yAxisMetric.value)}: ${formatAxisValue(yVal, yAxisMetric.value)}</div>`;
        if (zAxisMetric.value !== 'none' && zVal !== null) {
          html += `<div>${getAxisLabel(zAxisMetric.value as MetricKey)}: ${formatAxisValue(zVal, zAxisMetric.value as MetricKey)}</div>`;
        }
        html += '</div>';
        return html;
      },
    },
    series: [...trendSeries, ...scatterSeries],
  };
});
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticMetricExplorer',
};
</script>
