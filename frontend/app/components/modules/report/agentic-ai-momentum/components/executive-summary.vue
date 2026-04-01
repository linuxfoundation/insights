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
            last month ({{ formatNumberShort(communityGrowth.total) }} total contributors).
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
                >+{{ formatNumberShort(topGrowingProjects[0]?.delta ?? 0) }}</span
              >
              new contributors last month<template v-if="topGrowingProjects[1]"
                >, followed by
                <span class="font-bold text-neutral-900">{{ topGrowingProjects[1].name }}</span>
                (<span class="font-bold text-positive-500">+{{ formatNumberShort(topGrowingProjects[1].delta) }}</span
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
            last month).
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
                vs. last month)</template
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
                  vs. last month)</template
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
  AgenticProject,
  ContributorData,
  ResearchPapersData,
  CocomoValueData,
  CommitCountData,
  GitHubEcosystemBreadthData,
  IssueTimeToCloseData,
  PullRequestTimeToResolveData,
} from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  projectsData: AgenticProject[];
  contributorsData: ContributorData[];
  commitsData: CommitCountData[];
  researchData: ResearchPapersData[];
  githubBreadthData: GitHubEcosystemBreadthData[];
  cocomoData: CocomoValueData[];
  timeToCloseData: IssueTimeToCloseData[];
  prTimeToResolveData: PullRequestTimeToResolveData[];
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

const kpiCards = computed(() => [
  {
    label: 'Projects Tracked',
    value: formatNumber(props.projectsData.length),
    delta: null,
  },
  {
    label: 'Total Software Value (COCOMO)',
    value: formatNumberCurrency(totalProjectValue.value, 'USD'),
    delta: null,
  },
  {
    label: 'Total Contributors',
    value: formatNumberShort(contributorsWithDelta.value.value),
    delta: contributorsWithDelta.value.delta,
  },
  {
    label: 'Research Papers',
    value: formatNumberShort(researchPapersWithDelta.value.value),
    delta: researchPapersWithDelta.value.delta,
  },
]);

// Card 1: Community growth (contributors + commits)
const communityGrowth = computed(() => {
  const months = getSortedMonths(props.contributorsData);
  const latest = months.at(-1);
  const prev = months.at(-2);
  const latestContribs = props.contributorsData
    .filter((d) => d.month === latest)
    .reduce((s, d) => s + d.cumulative_contributors, 0);
  const prevContribs = props.contributorsData
    .filter((d) => d.month === prev)
    .reduce((s, d) => s + d.cumulative_contributors, 0);
  const latestCommits = props.commitsData
    .filter((d) => d.month === latest)
    .reduce((s, d) => s + d.cumulative_commits, 0);
  const prevCommits = props.commitsData.filter((d) => d.month === prev).reduce((s, d) => s + d.cumulative_commits, 0);
  return {
    contribDelta: latestContribs - prevContribs,
    commitDelta: latestCommits - prevCommits,
    total: latestContribs,
  };
});

// Card 2: Top growing projects by contributor delta
const topGrowingProjects = computed(() => {
  const months = getSortedMonths(props.contributorsData);
  const latest = months.at(-1);
  const prev = months.at(-2);
  const repos = [...new Set(props.contributorsData.map((d) => d.repo))];
  return repos
    .map((repo) => {
      const l = props.contributorsData.find((d) => d.repo === repo && d.month === latest)?.cumulative_contributors ?? 0;
      const p = props.contributorsData.find((d) => d.repo === repo && d.month === prev)?.cumulative_contributors ?? 0;
      const name = props.projectsData.find((proj) => proj.github_url === repo)?.name ?? repo;
      return { name, delta: l - p };
    })
    .filter((r) => r.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);
});

// Card 3: Research momentum (arXiv topics + GitHub search terms)
const researchHighlights = computed(() => {
  const filtered = props.researchData.filter((d) => d.month !== 'pre_window');
  const topics = [...new Set(filtered.map((d) => d.topic))];
  const months = getSortedMonths(props.researchData);
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

// Card 4: Ecosystem health (median issue time to close)
const healthMetrics = computed(() => {
  const months = getSortedMonths(props.timeToCloseData);
  const latest = months.at(-1);
  const prev = months.at(-2);

  const latestData = props.timeToCloseData.filter((d) => d.month === latest && d.median_time_to_close_days != null);
  const median =
    latestData.length > 0 ? latestData.reduce((s, d) => s + d.median_time_to_close_days, 0) / latestData.length : null;

  let delta: number | null = null;
  if (prev && median !== null) {
    const prevData = props.timeToCloseData.filter((d) => d.month === prev && d.median_time_to_close_days != null);
    if (prevData.length > 0) {
      const prevMedian = prevData.reduce((s, d) => s + d.median_time_to_close_days, 0) / prevData.length;
      delta = median - prevMedian;
    }
  }

  return { medianDays: median, count: latestData.length, delta };
});

// Card 4b: PR resolution time
const prHealthMetrics = computed(() => {
  const months = getSortedMonths(props.prTimeToResolveData);
  const latest = months.at(-1);
  const prev = months.at(-2);

  const latestData = props.prTimeToResolveData.filter(
    (d) => d.month === latest && d.median_time_to_resolve_days != null,
  );
  const median =
    latestData.length > 0
      ? latestData.reduce((s, d) => s + d.median_time_to_resolve_days, 0) / latestData.length
      : null;

  let delta: number | null = null;
  if (prev && median !== null) {
    const prevData = props.prTimeToResolveData.filter((d) => d.month === prev && d.median_time_to_resolve_days != null);
    if (prevData.length > 0) {
      const prevMedian = prevData.reduce((s, d) => s + d.median_time_to_resolve_days, 0) / prevData.length;
      delta = median - prevMedian;
    }
  }

  return { medianDays: median, count: latestData.length, delta };
});
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticExecutiveSummary',
};
</script>
