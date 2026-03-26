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
                :class="[
                  getLayerColors(row.layer).bg,
                  getLayerColors(row.layer).text,
                  getLayerColors(row.layer).border,
                ]"
              >
                {{ row.layer }}
              </span>
            </td>
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.stars !== null ? formatCompact(row.stars) : '-' }}</span>
                <delta-indicator
                  v-if="row.starsDelta !== null && row.starsDelta !== 0"
                  :value="row.starsDelta"
                />
              </div>
            </td>
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.forks !== null ? formatCompact(row.forks) : '-' }}</span>
                <delta-indicator
                  v-if="row.forksDelta !== null && row.forksDelta !== 0"
                  :value="row.forksDelta"
                />
              </div>
            </td>
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.commits !== null ? formatCompact(row.commits) : '-' }}</span>
                <delta-indicator
                  v-if="row.commitsDelta !== null && row.commitsDelta !== 0"
                  :value="row.commitsDelta"
                />
              </div>
            </td>
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.contributors !== null ? formatCompact(row.contributors) : '-' }}</span>
                <delta-indicator
                  v-if="row.contributorsDelta !== null && row.contributorsDelta !== 0"
                  :value="row.contributorsDelta"
                />
              </div>
            </td>
            <td class="py-3 px-2 text-right">
              {{ row.mergeRate !== null ? formatPercent(row.mergeRate) : '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ row.timeToClose !== null ? formatDays(row.timeToClose) : '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <span>{{ row.downloads !== null ? formatCompact(row.downloads) : '-' }}</span>
                <delta-indicator
                  v-if="row.downloadsDelta !== null && row.downloadsDelta !== 0"
                  :value="row.downloadsDelta"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h, type FunctionalComponent } from 'vue';
import { getLayerColors } from '../config/layer-colors';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
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
  isLoading: boolean;
}>();

// Delta indicator component
const DeltaIndicator: FunctionalComponent<{ value: number }> = (componentProps) => {
  const { value } = componentProps;
  if (value > 0) {
    return h('span', { class: 'text-positive-500 text-xs' }, `+${formatCompact(value)}`);
  } else if (value < 0) {
    return h('span', { class: 'text-negative-500 text-xs' }, formatCompact(value));
  }
  return null;
};
DeltaIndicator.props = ['value'];

type SortColumn =
  | 'rank'
  | 'name'
  | 'stars'
  | 'forks'
  | 'commits'
  | 'contributors'
  | 'mergeRate'
  | 'timeToClose'
  | 'downloads';
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

// Helper to get latest value from time series data
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

    // Get stars
    const stars = getLatestValue(props.stargazersData, githubUrl ?? '', 'cumulative_stars');

    // Get forks
    const forks = getLatestValue(props.forksData, githubUrl ?? '', 'cumulative_forks');

    // Get commits
    const commits = getLatestValue(props.commitsData, githubUrl ?? '', 'cumulative_commits');

    // Get contributors
    const contributors = getLatestValue(props.contributorsData, githubUrl ?? '', 'cumulative_contributors');

    // Get merge rate (just latest value)
    const mergeRateFiltered = props.mergeRateData.filter((d) => d.repo === githubUrl);
    const latestMergeRate = mergeRateFiltered.sort((a, b) => b.month.localeCompare(a.month))[0];
    const mergeRate = latestMergeRate?.pr_merge_rate ?? null;

    // Get time to close (just latest value)
    const timeToCloseFiltered = props.timeToCloseData.filter((d) => d.repo === githubUrl);
    const latestTimeToClose = timeToCloseFiltered.sort((a, b) => b.month.localeCompare(a.month))[0];
    const timeToClose = latestTimeToClose?.median_time_to_close_days ?? null;

    // Get downloads (sum all ecosystems for latest month)
    const downloadsFiltered = props.downloadsData.filter((d) => d.repo === githubUrl);
    const latestMonth =
      downloadsFiltered.length > 0 ? downloadsFiltered.sort((a, b) => b.month.localeCompare(a.month))[0]?.month : null;
    const latestDownloads = latestMonth
      ? downloadsFiltered.filter((d) => d.month === latestMonth).reduce((sum, d) => sum + d.download_counts, 0)
      : null;

    // Get previous month downloads for delta
    const months = [...new Set(downloadsFiltered.map((d) => d.month))].sort().reverse();
    const previousMonth = months[1];
    const previousDownloads = previousMonth
      ? downloadsFiltered.filter((d) => d.month === previousMonth).reduce((sum, d) => sum + d.download_counts, 0)
      : null;

    const downloadsDelta =
      latestDownloads !== null && previousDownloads !== null ? latestDownloads - previousDownloads : null;

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
      timeToClose,
      downloads: latestDownloads,
      downloadsDelta,
    };
  });
});

// Sorted data (show all projects)
const sortedData = computed(() => {
  const data = [...leaderboardData.value];
  const col = sortColumn.value;
  const dir = sortDirection.value;

  return data.sort((a, b) => {
    let comparison = 0;

    switch (col) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'stars':
        comparison = (a.stars ?? -1) - (b.stars ?? -1);
        break;
      case 'forks':
        comparison = (a.forks ?? -1) - (b.forks ?? -1);
        break;
      case 'commits':
        comparison = (a.commits ?? -1) - (b.commits ?? -1);
        break;
      case 'contributors':
        comparison = (a.contributors ?? -1) - (b.contributors ?? -1);
        break;
      case 'mergeRate':
        comparison = (a.mergeRate ?? -1) - (b.mergeRate ?? -1);
        break;
      case 'timeToClose':
        comparison = (a.timeToClose ?? -1) - (b.timeToClose ?? -1);
        break;
      case 'downloads':
        comparison = (a.downloads ?? -1) - (b.downloads ?? -1);
        break;
    }

    return dir === 'asc' ? comparison : -comparison;
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

// Handle row click - could navigate to Insights project page
function handleRowClick(row: ProjectLeaderboardRow) {
  if (row.githubUrl) {
    window.open(row.githubUrl, '_blank', 'noopener,noreferrer');
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticProjectLeaderboard',
};
</script>
