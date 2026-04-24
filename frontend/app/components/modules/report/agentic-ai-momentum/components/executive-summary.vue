<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- At a Glance -->
    <div class="flex flex-col gap-3">
      <h3 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">At a Glance</h3>
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
              {{ kpi.delta > 0 ? '+' : '' }}{{ formatNumberShort(kpi.delta) }} (last 30d)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Highlights -->
    <div class="flex flex-col gap-3">
      <h3 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Highlights</h3>
      <lfx-card class="p-4 md:p-6">
        <dl
          v-if="isLoading"
          class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3"
        >
          <template
            v-for="i in 4"
            :key="i"
          >
            <lfx-skeleton
              height="16px"
              width="80px"
            />
            <lfx-skeleton
              height="16px"
              width="100%"
            />
          </template>
        </dl>
        <dl
          v-else
          class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-4 text-body-2 text-neutral-500"
        >
          <!-- Community Growth -->
          <dt>
            <span
              class="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
            >
              <lfx-icon
                name="people-group"
                :size="12"
              />
              Community Growth
            </span>
          </dt>
          <dd class="flex items-center flex-wrap gap-x-1">
            The open source agentic AI ecosystem added
            <span class="font-bold text-positive-500 mx-1"
              >+{{ formatNumberShort(communityGrowth.contribDelta) }} contributors</span
            >
            and
            <span class="font-bold text-positive-500 mx-1"
              >+{{ formatNumberShort(communityGrowth.commitDelta) }} commits</span
            >
            last 30 days ({{ formatNumberShort(communityGrowth.total) }} total contributors).
          </dd>

          <!-- Most Active Projects -->
          <template v-if="topGrowingProjects.length > 0">
            <dt>
              <span
                class="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
              >
                <lfx-icon
                  name="chart-line"
                  :size="12"
                />
                Most Active
              </span>
            </dt>
            <dd class="flex items-center flex-wrap gap-x-1">
              <span class="font-bold text-neutral-900">{{ topGrowingProjects[0]?.name }}</span>
              led contributor growth with
              <span class="font-bold text-positive-500"
                >+{{ formatNumberShort(topGrowingProjects[0]?.newContributors ?? 0) }}</span
              >
              new contributors last 30 days<template v-if="topGrowingProjects[1]"
                >, followed by
                <span class="font-bold text-neutral-900">{{ topGrowingProjects[1].name }}</span>
                (<span class="font-bold text-positive-500"
                  >+{{ formatNumberShort(topGrowingProjects[1].newContributors) }}</span
                >)</template
              >.
            </dd>
          </template>

          <!-- Research Momentum -->
          <dt>
            <span
              class="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
            >
              <lfx-icon
                name="book-open"
                :size="12"
              />
              Research Momentum
            </span>
          </dt>
          <dd class="flex items-center flex-wrap gap-x-1">
            <span class="font-bold text-neutral-900">{{ researchHighlights.largestTopic }}</span>
            leads with
            <span class="font-bold text-neutral-900">{{ formatNumberShort(researchHighlights.largestCount) }}</span>
            research papers published to date. New research in
            <span class="font-bold text-neutral-900">{{ researchHighlights.fastestTopic }}</span>
            is growing fastest (<span class="font-bold text-positive-500"
              >+{{ (researchHighlights.fastestRate * 100).toFixed(0) }}%</span
            >
            last 30 days).
            <span class="font-bold text-neutral-900">{{ researchHighlights.topGhTerm }}</span>
            is the top GitHub search term with
            <span class="font-bold text-neutral-900">{{ formatNumberShort(researchHighlights.topGhRepos) }} repos</span>
            matching that term.
          </dd>

          <!-- Ecosystem Health -->
          <template v-if="healthMetrics.medianDays !== null">
            <dt>
              <span
                class="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
              >
                <lfx-icon
                  name="heart"
                  :size="12"
                />
                Ecosystem Health
              </span>
            </dt>
            <dd class="flex items-center flex-wrap gap-x-1">
              Median issue close time is
              <span class="font-bold text-neutral-900">{{ healthMetrics.medianDays.toFixed(0) }} days</span>
              across {{ healthMetrics.count }} projects<template v-if="healthMetrics.delta !== null">
                (<span
                  class="font-bold"
                  :class="healthMetrics.delta > 0 ? 'text-negative-500' : 'text-positive-500'"
                  >{{ healthMetrics.delta > 0 ? '+' : '' }}{{ healthMetrics.delta.toFixed(0) }}d</span
                >
                vs. last 30 days)</template
              >.
              <template v-if="prHealthMetrics.medianDays !== null">
                Median pull request resolution time is
                <span class="font-bold text-neutral-900">{{ prHealthMetrics.medianDays.toFixed(0) }} days</span>
                across {{ prHealthMetrics.count }} projects<template v-if="prHealthMetrics.delta !== null">
                  (<span
                    class="font-bold"
                    :class="prHealthMetrics.delta > 0 ? 'text-negative-500' : 'text-positive-500'"
                    >{{ prHealthMetrics.delta > 0 ? '+' : '' }}{{ prHealthMetrics.delta.toFixed(0) }}d</span
                  >
                  vs. last 30 days)</template
                >.
              </template>
            </dd>
          </template>
        </dl>
      </lfx-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber, formatNumberCurrency, formatNumberShort } from '~/components/shared/utils/formatter';
import { getResearchTopicLabel } from '~/components/modules/report/agentic-ai-momentum/config/layer-colors';
import type {
  AgenticGlanceData,
  ResearchPapersData,
  GitHubEcosystemBreadthData,
} from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  glanceData: AgenticGlanceData | null;
  researchData: ResearchPapersData[];
  githubBreadthData: GitHubEcosystemBreadthData[];
  isLoading: boolean;
}>();

// ── At a Glance KPIs ──────────────────────────────────────────────────────────

// Calculate total research papers with delta (last 30 days's papers as delta)
const researchPapersWithDelta = computed(() => {
  const filtered = props.researchData.filter((d) => d.month !== 'pre_window');
  if (filtered.length === 0) return { value: 0, delta: null };

  const total = filtered.reduce((sum, d) => sum + d.paper_count, 0);

  const months = [...new Set(filtered.map((d) => d.month))].sort();
  const latestMonth = months.at(-1);
  const latestMonthPapers = filtered.filter((d) => d.month === latestMonth).reduce((sum, d) => sum + d.paper_count, 0);

  return { value: total, delta: latestMonthPapers };
});

const kpiCards = computed(() => [
  {
    label: 'Projects Tracked',
    value: formatNumber(props.glanceData?.totalCount ?? 0),
    delta: null,
  },
  {
    label: 'Total Software Value (COCOMO)',
    value: formatNumberCurrency(props.glanceData?.totalSoftwareValue ?? 0, 'USD'),
    delta: null,
  },
  {
    label: 'Total Contributors',
    value: formatNumberShort(props.glanceData?.totalContributorCount ?? 0),
    delta: props.glanceData?.totalContributorCount30d ?? null,
  },
  {
    label: 'Research Papers',
    value: formatNumberShort(researchPapersWithDelta.value.value),
    delta: researchPapersWithDelta.value.delta,
  },
]);

// ── Highlights ────────────────────────────────────────────────────────────────

// Card 1: Community growth (contributors + commits)
const communityGrowth = computed(() => ({
  contribDelta: props.glanceData?.totalContributorCount30d ?? 0,
  commitDelta: props.glanceData?.commitsCount30d ?? 0,
  total: props.glanceData?.totalContributorCount ?? 0,
}));

// Card 2: Top growing projects by new contributors (from glance endpoint)
const topGrowingProjects = computed(() => {
  return (props.glanceData?.mostActiveProjects ?? []).slice(0, 2);
});

// Card 3: Research momentum (arXiv topics + GitHub search terms) — still from static JSON
const researchHighlights = computed(() => {
  const filtered = props.researchData.filter((d) => d.month !== 'pre_window');
  const topics = [...new Set(filtered.map((d) => d.topic))];
  const months = [...new Set(filtered.map((d) => d.month))].sort();
  const latest = months.at(-1);
  const prev = months.at(-2);

  const totals: Record<string, number> = Object.fromEntries(
    topics.map((t) => [t, filtered.filter((d) => d.topic === t).reduce((s, d) => s + d.paper_count, 0)]),
  );
  const largestTopic = [...topics].sort((a, b) => (totals[b] ?? 0) - (totals[a] ?? 0))[0];

  const growthRates: Record<string, number> = Object.fromEntries(
    topics.map((t) => {
      const l = filtered.filter((d) => d.topic === t && d.month === latest).reduce((s, d) => s + d.paper_count, 0);
      const p = filtered.filter((d) => d.topic === t && d.month === prev).reduce((s, d) => s + d.paper_count, 0);
      return [t, p > 0 ? (l - p) / p : 0];
    }),
  );
  const fastestTopic = [...topics].sort((a, b) => (growthRates[b] ?? 0) - (growthRates[a] ?? 0))[0];

  const searchTerms = [...new Set(props.githubBreadthData.map((d) => d.search_term))];
  const ghTotals = searchTerms
    .map((term) => {
      const entry = props.githubBreadthData
        .filter((d) => d.search_term === term)
        .sort((a, b) => b.month.localeCompare(a.month))[0];
      return { term, repos: entry?.repo_count ?? 0 };
    })
    .sort((a, b) => b.repos - a.repos);
  const topGhTerm = ghTotals[0];

  return {
    largestTopic: getResearchTopicLabel(largestTopic),
    largestCount: totals[largestTopic] ?? 0,
    fastestTopic: getResearchTopicLabel(fastestTopic),
    fastestRate: growthRates[fastestTopic] ?? 0,
    topGhTerm: getResearchTopicLabel(topGhTerm?.term ?? ''),
    topGhRepos: topGhTerm?.repos ?? 0,
  };
});

// Card 4: Ecosystem health from glance endpoint
const healthMetrics = computed(() => {
  if (!props.glanceData) return { medianDays: null, count: 0, delta: null };
  const medianDays = props.glanceData.medianIssueCloseTimeDays;
  const delta = props.glanceData.medianIssueCloseTimeDays30d - medianDays;
  return {
    medianDays,
    count: props.glanceData.projectsWithGithubIssueActivity,
    delta,
  };
});

const prHealthMetrics = computed(() => {
  if (!props.glanceData) return { medianDays: null, count: 0, delta: null };
  const medianDays = props.glanceData.medianPrResolutionTimeDays;
  const delta = props.glanceData.medianPrResolutionTimeDays30d - medianDays;
  return {
    medianDays,
    count: props.glanceData.projectsWithGithubPrActivity,
    delta,
  };
});
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticExecutiveSummary',
};
</script>
