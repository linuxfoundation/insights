<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <!-- KPI Cards Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="bg-neutral-50 rounded-lg p-3 md:p-4 flex flex-col gap-1"
      >
        <div class="text-body-2 text-neutral-500">
          {{ kpi.label }}
        </div>
        <div v-if="isLoading">
          <lfx-skeleton
            height="32px"
            width="80%"
          />
        </div>
        <div
          v-else
          class="flex items-baseline gap-2"
        >
          <span class="text-heading-3 md:text-heading-2 font-bold text-neutral-900">{{ kpi.value }}</span>
          <span
            v-if="kpi.delta"
            class="text-xs font-medium"
            :class="kpi.delta > 0 ? 'text-positive-500' : 'text-negative-500'"
          >
            {{ kpi.delta > 0 ? '+' : '' }}{{ formatCompactNumber(kpi.delta) }} (last 30d)
          </span>
        </div>
      </div>
    </div>

    <!-- Key Takeaways -->
    <lfx-card class="p-4 md:p-6">
      <h3 class="text-body-1 font-semibold text-neutral-900 mb-3">Key Takeaways</h3>
      <ul class="flex flex-col gap-2 text-body-2 text-neutral-700">
        <li
          v-for="(takeaway, index) in takeaways"
          :key="index"
          class="flex items-start gap-2"
        >
          <span class="text-brand-500 mt-1">
            <lfx-icon
              name="check-circle"
              :size="16"
            />
          </span>
          <span>{{ takeaway }}</span>
        </li>
      </ul>
    </lfx-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import type {
  AgenticProject,
  ContributorData,
  ResearchPapersData,
  CocomoValueData,
} from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  projectsData: AgenticProject[];
  contributorsData: ContributorData[];
  researchData: ResearchPapersData[];
  cocomoData: CocomoValueData[];
  isLoading: boolean;
}>();

// Get latest month from data
function getLatestMonth(data: Array<{ month: string }>): string {
  const months = data
    .map((d) => d.month)
    .filter((m) => m !== 'pre_window')
    .sort();
  return months[months.length - 1] || '';
}

// Get sorted unique months
function getSortedMonths(data: Array<{ month: string }>): string[] {
  const months = new Set(data.map((d) => d.month).filter((m) => m !== 'pre_window'));
  return Array.from(months).sort();
}

// Calculate total contributors with delta
const contributorsWithDelta = computed(() => {
  const months = getSortedMonths(props.contributorsData);
  if (months.length === 0) return { value: 0, delta: null };

  const latestMonth = months[months.length - 1];
  const previousMonth = months.length > 1 ? months[months.length - 2] : null;

  const latestData = props.contributorsData.filter((d) => d.month === latestMonth);
  const latestTotal = latestData.reduce((sum, d) => sum + d.cumulative_contributors, 0);

  let delta = null;
  if (previousMonth) {
    const previousData = props.contributorsData.filter((d) => d.month === previousMonth);
    const previousTotal = previousData.reduce((sum, d) => sum + d.cumulative_contributors, 0);
    delta = latestTotal - previousTotal;
  }

  return { value: latestTotal, delta };
});

// Calculate total project value from COCOMO (sum of latest values per repo)
const totalProjectValue = computed(() => {
  const latestMonth = getLatestMonth(props.cocomoData);
  if (!latestMonth) return 0;

  const latestData = props.cocomoData.filter((d) => d.month === latestMonth);
  return latestData.reduce((sum, d) => sum + d.estimated_cost_usd, 0);
});

// Calculate total research papers with delta (last month's papers as delta)
const researchPapersWithDelta = computed(() => {
  const months = getSortedMonths(props.researchData);
  if (months.length === 0) return { value: 0, delta: null };

  const total = props.researchData.filter((d) => d.month !== 'pre_window').reduce((sum, d) => sum + d.paper_count, 0);

  const latestMonth = months[months.length - 1];
  const latestMonthPapers = props.researchData
    .filter((d) => d.month === latestMonth)
    .reduce((sum, d) => sum + d.paper_count, 0);

  return { value: total, delta: latestMonthPapers };
});

// Format large numbers
function formatCompact(value: number): string {
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

function formatCompactNumber(value: number): string {
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

const kpiCards = computed(() => [
  {
    label: 'Projects Tracked',
    value: formatNumber(props.projectsData.length),
    delta: null,
  },
  {
    label: 'Total Software Value (COCOMO)',
    value: formatCompact(totalProjectValue.value),
    delta: null,
  },
  {
    label: 'Total Contributors',
    value: formatCompactNumber(contributorsWithDelta.value.value),
    delta: contributorsWithDelta.value.delta,
  },
  {
    label: 'Research Papers',
    value: formatCompactNumber(researchPapersWithDelta.value.value),
    delta: researchPapersWithDelta.value.delta,
  },
]);

// Key takeaways - these could be computed dynamically based on data trends
const takeaways = computed(() => {
  const takeawaysList: string[] = [];

  if (props.projectsData.length > 0) {
    const orchestrationCount = props.projectsData.filter((p) => p.layer === 'Orchestration & Multi-Agent').length;
    takeawaysList.push(
      `Orchestration & Multi-Agent is the largest layer with ${orchestrationCount} projects, reflecting the industry focus on agent coordination.`,
    );
  }

  if (researchPapersWithDelta.value.value > 0) {
    takeawaysList.push(
      `Research momentum continues with ${formatCompactNumber(researchPapersWithDelta.value.value)} arXiv papers published across all agentic AI topics.`,
    );
  }

  takeawaysList.push(
    'Open source protocols like MCP and A2A are establishing interoperability standards for the agentic AI ecosystem.',
  );

  return takeawaysList;
});
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticExecutiveSummary',
};
</script>
