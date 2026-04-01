<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div v-if="isLoading">
      <div class="flex flex-col gap-2">
        <lfx-skeleton
          v-for="i in 6"
          :key="i"
          height="40px"
          width="100%"
        />
      </div>
    </div>

    <div
      v-else-if="tableData.length === 0"
      class="flex items-center justify-center h-[200px]"
    >
      <div class="text-neutral-500">No GitHub activity data available.</div>
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="w-full text-body-2">
        <thead>
          <tr class="border-b border-neutral-200">
            <th
              class="text-left py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('term')"
            >
              <div class="flex items-center gap-1">
                Search Term
                <lfx-icon
                  v-if="sortColumn === 'term'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('repos')"
            >
              <div class="flex items-center justify-end gap-1">
                Repos
                <lfx-icon
                  v-if="sortColumn === 'repos'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('issues')"
            >
              <div class="flex items-center justify-end gap-1">
                Issues
                <lfx-icon
                  v-if="sortColumn === 'issues'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('discussions')"
            >
              <div class="flex items-center justify-end gap-1">
                Discussions
                <lfx-icon
                  v-if="sortColumn === 'discussions'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('total')"
            >
              <div class="flex items-center justify-end gap-1">
                Total
                <lfx-icon
                  v-if="sortColumn === 'total'"
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
            :key="row.term"
            class="border-b border-neutral-100 hover:bg-neutral-50"
          >
            <td class="py-3 px-2 text-neutral-900">
              {{ formatSearchTerm(row.term) }}
            </td>
            <td
              class="py-3 px-2 text-right"
              :style="getCellStyle(row.repos, maxRepos)"
            >
              {{ formatNumber(row.repos) }}
            </td>
            <td
              class="py-3 px-2 text-right"
              :style="getCellStyle(row.issues, maxIssues)"
            >
              {{ formatNumber(row.issues) }}
            </td>
            <td
              class="py-3 px-2 text-right"
              :style="getCellStyle(row.discussions, maxDiscussions)"
            >
              {{ formatNumber(row.discussions) }}
            </td>
            <td
              class="py-3 px-2 text-right font-semibold"
              :style="getCellStyle(row.total, maxTotal)"
            >
              {{ formatNumber(row.total) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getResearchTopicLabel } from '../config/layer-colors';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { GitHubEcosystemBreadthData } from '~~/types/report/agentic-ai-momentum.types';

interface TableRow {
  term: string;
  repos: number;
  issues: number;
  discussions: number;
  total: number;
}

const props = defineProps<{
  data: GitHubEcosystemBreadthData[];
  isLoading: boolean;
}>();

type SortColumn = 'term' | 'repos' | 'issues' | 'discussions' | 'total';
const sortColumn = ref<SortColumn>('total');
const sortDirection = ref<'asc' | 'desc'>('desc');

function sortBy(column: SortColumn) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'desc';
  }
}

// Transform data into table rows (using latest month only)
const tableData = computed<TableRow[]>(() => {
  // Get unique search terms
  const terms = new Set(props.data.map((d) => d.search_term));

  return Array.from(terms).map((term) => {
    // Find the latest data for this term
    const termData = props.data.filter((d) => d.search_term === term);
    const latestData = termData.sort((a, b) => b.month.localeCompare(a.month))[0];

    if (!latestData) {
      return {
        term,
        repos: 0,
        issues: 0,
        discussions: 0,
        total: 0,
      };
    }

    return {
      term,
      repos: latestData.repo_count,
      issues: latestData.issue_count,
      discussions: latestData.discussion_count,
      total: latestData.repo_count + latestData.issue_count + latestData.discussion_count,
    };
  });
});

// Calculate max values for heatmap scaling
const maxRepos = computed(() => Math.max(...tableData.value.map((d) => d.repos)));
const maxIssues = computed(() => Math.max(...tableData.value.map((d) => d.issues)));
const maxDiscussions = computed(() => Math.max(...tableData.value.map((d) => d.discussions)));
const maxTotal = computed(() => Math.max(...tableData.value.map((d) => d.total)));

// Sorted data
const sortedData = computed(() => {
  const data = [...tableData.value];
  const col = sortColumn.value;
  const dir = sortDirection.value;

  return data.sort((a, b) => {
    let comparison = 0;
    if (col === 'term') {
      comparison = a.term.localeCompare(b.term);
    } else {
      comparison = a[col] - b[col];
    }
    return dir === 'asc' ? comparison : -comparison;
  });
});

// Format search term to human readable
function formatSearchTerm(term: string): string {
  return getResearchTopicLabel(term);
}

// Get cell background style based on value (heatmap effect)
function getCellStyle(value: number, max: number): Record<string, string> {
  if (max === 0) return {};

  const intensity = value / max;
  const opacity = 0.1 + intensity * 0.4; // Range from 0.1 to 0.5

  return {
    backgroundColor: `rgba(59, 130, 246, ${opacity})`, // blue-500
  };
}
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticGithubActivityTable',
};
</script>
