<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div v-if="isLoading">
      <div class="flex flex-col gap-2">
        <lfx-skeleton
          v-for="i in 10"
          :key="i"
          height="48px"
          width="100%"
        />
      </div>
    </div>

    <div
      v-else-if="leaderboardData.length === 0"
      class="flex items-center justify-center h-[200px]"
    >
      <div class="text-neutral-500">No project data available.</div>
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs text-neutral-400">Select a project to view more detailed metrics</p>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-neutral-500 whitespace-nowrap">Sort by</span>
            <lfx-tabs
              v-model="sortMode"
              :tabs="SORT_MODE_TABS"
              width-type="inline"
            />
          </div>
          <div class="relative">
            <button
              class="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-1 hover:bg-neutral-50"
              @click.stop="showColumnPicker = !showColumnPicker"
            >
              Columns
              <lfx-icon
                :name="showColumnPicker ? 'chevron-up' : 'chevron-down'"
                :size="12"
              />
            </button>
            <div
              v-if="showColumnPicker"
              class="absolute right-0 top-8 z-10 bg-white border border-neutral-200 rounded shadow-md p-3 flex flex-col gap-2 min-w-[200px]"
              @click.stop
            >
              <label
                v-for="col in COLUMN_CONFIG"
                :key="col.key"
                class="flex items-center gap-2 cursor-pointer text-body-2 text-neutral-700 hover:text-neutral-900"
              >
                <input
                  type="checkbox"
                  :checked="activeColumns.includes(col.key)"
                  class="cursor-pointer"
                  @change="toggleColumn(col.key)"
                />
                {{ col.label }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <table class="w-full text-body-2">
        <thead>
          <tr class="border-b border-neutral-200">
            <th
              class="text-left py-3 px-2 font-semibold text-neutral-700 w-12 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('rank')"
            >
              <div class="flex items-center gap-1">
                #
                <lfx-icon
                  v-if="sortColumn === 'rank'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              class="text-left py-3 px-2 font-semibold text-neutral-700 min-w-[180px] cursor-pointer hover:bg-neutral-50"
              @click="sortBy('name')"
            >
              <div class="flex items-center gap-1">
                Project
                <lfx-icon
                  v-if="sortColumn === 'name'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th class="text-left py-3 px-2 font-semibold text-neutral-700 min-w-[140px]">Layer</th>
            <th
              v-if="activeColumns.includes('stars')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('stars')"
            >
              <div class="flex items-center justify-end gap-1">
                Stars
                <lfx-icon
                  v-if="sortColumn === 'stars'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('forks')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('forks')"
            >
              <div class="flex items-center justify-end gap-1">
                Forks
                <lfx-icon
                  v-if="sortColumn === 'forks'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('commits')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('commits')"
            >
              <div class="flex items-center justify-end gap-1">
                Commits
                <lfx-icon
                  v-if="sortColumn === 'commits'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('contributors')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('contributors')"
            >
              <div class="flex items-center justify-end gap-1">
                Contributors
                <lfx-icon
                  v-if="sortColumn === 'contributors'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('mergeRate')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('mergeRate')"
            >
              <div class="flex items-center justify-end gap-1">
                Merge Rate
                <lfx-icon
                  v-if="sortColumn === 'mergeRate'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('timeToClose')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('timeToClose')"
            >
              <div class="flex items-center justify-end gap-1">
                Time to Close
                <lfx-icon
                  v-if="sortColumn === 'timeToClose'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('downloads')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('downloads')"
            >
              <div class="flex items-center justify-end gap-1">
                Downloads
                <lfx-icon
                  v-if="sortColumn === 'downloads'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('cocomoValue')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('cocomoValue')"
            >
              <div class="flex items-center justify-end gap-1">
                COCOMO Value
                <lfx-icon
                  v-if="sortColumn === 'cocomoValue'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('prTimeToResolve')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('prTimeToResolve')"
            >
              <div class="flex items-center justify-end gap-1">
                PR Resolve Time
                <lfx-icon
                  v-if="sortColumn === 'prTimeToResolve'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('totalVulnerabilities')"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('totalVulnerabilities')"
            >
              <div class="flex items-center justify-end gap-1">
                Vulnerabilities
                <lfx-icon
                  v-if="sortColumn === 'totalVulnerabilities'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in sortedData"
            :key="row.rank"
            class="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
            @click="handleRowClick(row)"
          >
            <td class="py-3 px-2 text-neutral-500">
              {{ row.rank }}
            </td>
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <span class="font-medium text-neutral-900">{{ row.name }}</span>
                <a
                  v-if="row.githubUrl"
                  :href="row.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-neutral-400 hover:text-neutral-600"
                  :aria-label="`View ${row.name} on GitHub`"
                  @click.stop
                >
                  <lfx-icon
                    name="github"
                    type="brands"
                    :size="16"
                  />
                </a>
              </div>
            </td>
            <td class="py-3 px-2">
              <span
                class="inline-flex px-2 py-1 rounded text-xs font-medium border"
                :style="getLayerBadgeStyle(row.layer)"
              >
                {{ row.layer }}
              </span>
            </td>
            <td
              v-if="activeColumns.includes('stars')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.stars !== null ? formatCompact(row.stars) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.starsDelta !== null && row.starsDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator :value="row.starsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('forks')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.forks !== null ? formatCompact(row.forks) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.forksDelta !== null && row.forksDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator :value="row.forksDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('commits')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.commits !== null ? formatCompact(row.commits) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.commitsDelta !== null && row.commitsDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator :value="row.commitsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('contributors')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.contributors !== null ? formatCompact(row.contributors) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.contributorsDelta !== null && row.contributorsDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator :value="row.contributorsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('mergeRate')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.mergeRate !== null ? formatPercent(row.mergeRate) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.mergeRateDelta !== null && row.mergeRateDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator
                    :value="row.mergeRateDelta"
                    format="percent"
                  />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('timeToClose')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.timeToClose !== null ? formatDays(row.timeToClose) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.timeToCloseDelta !== null && row.timeToCloseDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator
                    :value="row.timeToCloseDelta"
                    format="days"
                    :invert="true"
                  />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('downloads')"
              class="py-3 px-2 text-right"
            >
              {{ row.downloads !== null ? formatCompact(row.downloads) : '-' }}
            </td>
            <td
              v-if="activeColumns.includes('cocomoValue')"
              class="py-3 px-2 text-right"
            >
              {{ row.cocomoValue !== null ? formatDollars(row.cocomoValue) : '-' }}
            </td>
            <td
              v-if="activeColumns.includes('prTimeToResolve')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.prTimeToResolve !== null ? formatDays(row.prTimeToResolve) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.prTimeToResolveDelta !== null && row.prTimeToResolveDelta !== 0"
                  content="vs. previous 30d"
                >
                  <delta-indicator
                    :value="row.prTimeToResolveDelta"
                    format="days"
                    :invert="true"
                  />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('totalVulnerabilities')"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.totalVulnerabilities !== null ? formatCompact(row.totalVulnerabilities) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.totalVulnerabilitiesDelta !== null && row.totalVulnerabilitiesDelta !== 0"
                  content="vs. previous 30d"
                >
                  <vuln-delta-indicator :value="row.totalVulnerabilitiesDelta" />
                </lfx-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h, onMounted, onUnmounted, type FunctionalComponent } from 'vue';
import { getLayerBadgeStyle } from '../config/layer-colors';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  AgenticProject,
  StargazersData,
  ForkData,
  CommitCountData,
  ContributorData,
  PullRequestMergeRateData,
  IssueTimeToCloseData,
  PackageDownloadsData,
  CocomoValueData,
  PullRequestTimeToResolveData,
  VulnerabilitiesData,
  ProjectLeaderboardRow,
} from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  projectsData: AgenticProject[];
  stargazersData: StargazersData[];
  forksData: ForkData[];
  commitsData: CommitCountData[];
  contributorsData: ContributorData[];
  mergeRateData: PullRequestMergeRateData[];
  timeToCloseData: IssueTimeToCloseData[];
  downloadsData: PackageDownloadsData[];
  cocomoData: CocomoValueData[];
  prTimeToResolveData: PullRequestTimeToResolveData[];
  vulnerabilitiesData: VulnerabilitiesData[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  'select-project': [row: ProjectLeaderboardRow];
}>();

// Column configuration
const COLUMN_CONFIG = [
  { key: 'stars', label: 'Stars', defaultOn: true },
  { key: 'commits', label: 'Commits', defaultOn: true },
  { key: 'contributors', label: 'Contributors', defaultOn: true },
  { key: 'timeToClose', label: 'Time to Close', defaultOn: true },
  { key: 'downloads', label: 'Downloads', defaultOn: true },
  { key: 'cocomoValue', label: 'COCOMO Value', defaultOn: true },
  { key: 'mergeRate', label: 'Merge Rate', defaultOn: false },
  { key: 'forks', label: 'Forks', defaultOn: false },
  { key: 'prTimeToResolve', label: 'PR Resolve Time', defaultOn: false },
  { key: 'totalVulnerabilities', label: 'Vulnerabilities', defaultOn: false },
] as const;

type ColumnKey = (typeof COLUMN_CONFIG)[number]['key'];

const activeColumns = ref<ColumnKey[]>(COLUMN_CONFIG.filter((c) => c.defaultOn).map((c) => c.key));
const showColumnPicker = ref(false);

// Sort mode toggle
const SORT_MODE_TABS = [
  { value: 'level', label: 'Level' },
  { value: 'delta', label: 'Change' },
];
const sortMode = ref<'level' | 'delta'>('level');

function toggleColumn(key: ColumnKey) {
  const idx = activeColumns.value.indexOf(key);
  if (idx === -1) {
    activeColumns.value.push(key);
  } else {
    activeColumns.value.splice(idx, 1);
  }
}

// Close picker on outside click
function handleOutsideClick() {
  showColumnPicker.value = false;
}
onMounted(() => document.addEventListener('click', handleOutsideClick));
onUnmounted(() => document.removeEventListener('click', handleOutsideClick));

// Delta indicator: standard (green=positive, red=negative)
const DeltaIndicator: FunctionalComponent<{ value: number; format?: string; invert?: boolean }> = (componentProps) => {
  const { value, format = 'number', invert = false } = componentProps;
  const isPositive = invert ? value < 0 : value > 0;
  const colorClass = isPositive ? 'text-positive-500' : 'text-negative-500';
  let display: string;
  if (format === 'percent') {
    display = `${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`;
  } else if (format === 'days') {
    display = `${value > 0 ? '+' : ''}${value.toFixed(0)}d`;
  } else {
    display = value > 0 ? `+${formatCompact(value)}` : formatCompact(value);
  }
  return h('span', { class: `${colorClass} text-xs` }, display);
};
DeltaIndicator.props = ['value', 'format', 'invert'];

// Vulnerability delta: increases are always red (bad), no green state
const VulnDeltaIndicator: FunctionalComponent<{ value: number }> = (componentProps) => {
  const { value } = componentProps;
  if (value > 0) {
    return h('span', { class: 'text-violet-500 text-xs' }, `+${formatCompact(value)}`);
  }
  return null;
};
VulnDeltaIndicator.props = ['value'];

type SortColumn =
  | 'rank'
  | 'name'
  | 'stars'
  | 'forks'
  | 'commits'
  | 'contributors'
  | 'mergeRate'
  | 'timeToClose'
  | 'downloads'
  | 'cocomoValue'
  | 'prTimeToResolve'
  | 'totalVulnerabilities';

const sortColumn = ref<SortColumn>('rank');
const sortDirection = ref<'asc' | 'desc'>('asc');

function sortBy(column: SortColumn) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = column === 'rank' || column === 'name' ? 'asc' : 'desc';
  }
}

// Helper to get latest value and delta from time series data
function getLatestValue<T extends { month: string }>(
  data: T[],
  repo: string,
  valueKey: keyof T,
): { value: number | null; delta: number | null } {
  const repoData = data.filter((d) => d.repo === repo).sort((a, b) => b.month.localeCompare(a.month));

  if (repoData.length === 0) {
    return { value: null, delta: null };
  }

  const latest = repoData[0];
  const previous = repoData[1];

  const value = latest[valueKey] as number;
  const delta = previous ? value - (previous[valueKey] as number) : null;

  return { value, delta };
}

// Build leaderboard data
const leaderboardData = computed<ProjectLeaderboardRow[]>(() => {
  return props.projectsData.map((project) => {
    const githubUrl = project.github_url;

    const stars = getLatestValue(props.stargazersData, githubUrl ?? '', 'cumulative_stars');
    const forks = getLatestValue(props.forksData, githubUrl ?? '', 'cumulative_forks');
    const commits = getLatestValue(props.commitsData, githubUrl ?? '', 'cumulative_commits');
    const contributors = getLatestValue(props.contributorsData, githubUrl ?? '', 'cumulative_contributors');

    // Merge rate with delta
    const mergeRateFiltered = props.mergeRateData
      .filter((d) => d.repo === githubUrl)
      .sort((a, b) => b.month.localeCompare(a.month));
    const mergeRate = mergeRateFiltered[0]?.pr_merge_rate ?? null;
    const mergeRateDelta =
      mergeRate !== null && mergeRateFiltered[1] !== undefined ? mergeRate - mergeRateFiltered[1].pr_merge_rate : null;

    // Time to close with delta
    const timeToCloseFiltered = props.timeToCloseData
      .filter((d) => d.repo === githubUrl)
      .sort((a, b) => b.month.localeCompare(a.month));
    const timeToClose = timeToCloseFiltered[0]?.median_time_to_close_days ?? null;
    const timeToCloseDelta =
      timeToClose !== null && timeToCloseFiltered[1] !== undefined
        ? timeToClose - timeToCloseFiltered[1].median_time_to_close_days
        : null;

    // Downloads (no delta per plan)
    const downloadsFiltered = props.downloadsData.filter((d) => d.repo === githubUrl);
    const latestMonth =
      downloadsFiltered.length > 0 ? downloadsFiltered.sort((a, b) => b.month.localeCompare(a.month))[0]?.month : null;
    const latestDownloads = latestMonth
      ? downloadsFiltered.filter((d) => d.month === latestMonth).reduce((sum, d) => sum + d.download_counts, 0)
      : null;

    // Previous month downloads delta
    const months = [...new Set(downloadsFiltered.map((d) => d.month))].sort().reverse();
    const previousMonth = months[1];
    const previousDownloads = previousMonth
      ? downloadsFiltered.filter((d) => d.month === previousMonth).reduce((sum, d) => sum + d.download_counts, 0)
      : null;
    const downloadsDelta =
      latestDownloads !== null && previousDownloads !== null ? latestDownloads - previousDownloads : null;

    // COCOMO value (no delta per plan)
    const cocomoValue = getLatestValue(props.cocomoData, githubUrl ?? '', 'estimated_cost_usd').value;

    // PR time to resolve with delta
    const prTimeToResolve = getLatestValue(props.prTimeToResolveData, githubUrl ?? '', 'median_time_to_resolve_days');

    // Total vulnerabilities with delta
    const totalVulnerabilities = getLatestValue(props.vulnerabilitiesData, githubUrl ?? '', 'vulnerabilities_count');

    return {
      rank: project.rank,
      name: project.name,
      layer: project.layer,
      license: project.license,
      githubUrl,
      stars: stars.value,
      starsDelta: stars.delta,
      forks: forks.value,
      forksDelta: forks.delta,
      commits: commits.value,
      commitsDelta: commits.delta,
      contributors: contributors.value,
      contributorsDelta: contributors.delta,
      mergeRate,
      mergeRateDelta,
      timeToClose,
      timeToCloseDelta,
      downloads: latestDownloads,
      downloadsDelta,
      cocomoValue,
      prTimeToResolve: prTimeToResolve.value,
      prTimeToResolveDelta: prTimeToResolve.delta,
      totalVulnerabilities: totalVulnerabilities.value,
      totalVulnerabilitiesDelta: totalVulnerabilities.delta,
    };
  });
});

// Map column keys to their delta fields (null = no delta available)
const DELTA_FIELD: Partial<Record<SortColumn, keyof ProjectLeaderboardRow>> = {
  stars: 'starsDelta',
  forks: 'forksDelta',
  commits: 'commitsDelta',
  contributors: 'contributorsDelta',
  mergeRate: 'mergeRateDelta',
  timeToClose: 'timeToCloseDelta',
  prTimeToResolve: 'prTimeToResolveDelta',
  totalVulnerabilities: 'totalVulnerabilitiesDelta',
};

// Null-last numeric comparator: nulls always sort after non-null values, regardless of direction
function cmpNullLast(av: number | null, bv: number | null, dir: 'asc' | 'desc'): number {
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  return dir === 'asc' ? av - bv : bv - av;
}

// Sorted data
const sortedData = computed(() => {
  const data = [...leaderboardData.value];
  const col = sortColumn.value;
  const dir = sortDirection.value;
  const useDelta = sortMode.value === 'delta' && col in DELTA_FIELD;

  return data.sort((a, b) => {
    if (useDelta) {
      const deltaKey = DELTA_FIELD[col]!;
      return cmpNullLast(a[deltaKey] as number | null, b[deltaKey] as number | null, dir);
    }

    switch (col) {
      case 'rank':
        return dir === 'asc' ? a.rank - b.rank : b.rank - a.rank;
      case 'name':
        return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      case 'stars':
        return cmpNullLast(a.stars, b.stars, dir);
      case 'forks':
        return cmpNullLast(a.forks, b.forks, dir);
      case 'commits':
        return cmpNullLast(a.commits, b.commits, dir);
      case 'contributors':
        return cmpNullLast(a.contributors, b.contributors, dir);
      case 'mergeRate':
        return cmpNullLast(a.mergeRate, b.mergeRate, dir);
      case 'timeToClose':
        return cmpNullLast(a.timeToClose, b.timeToClose, dir);
      case 'downloads':
        return cmpNullLast(a.downloads, b.downloads, dir);
      case 'cocomoValue':
        return cmpNullLast(a.cocomoValue, b.cocomoValue, dir);
      case 'prTimeToResolve':
        return cmpNullLast(a.prTimeToResolve, b.prTimeToResolve, dir);
      case 'totalVulnerabilities':
        return cmpNullLast(a.totalVulnerabilities, b.totalVulnerabilities, dir);
      default:
        return 0;
    }
  });
});

// Format helpers
function formatCompact(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return formatNumber(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function formatDays(value: number): string {
  return `${value.toFixed(0)}d`;
}

function formatDollars(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${formatNumber(value)}`;
}

function handleRowClick(row: ProjectLeaderboardRow) {
  emit('select-project', row);
}
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticProjectLeaderboard',
};
</script>
