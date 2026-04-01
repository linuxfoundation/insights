<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-6 md:py-10 flex flex-col gap-6 md:gap-8">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-heading-3 md:text-heading-1 font-secondary font-bold text-neutral-900 mb-2">
          Agentic AI Momentum
        </h1>
        <p class="text-body-2 md:text-body-1 text-neutral-600">
          Tracking the most critical agentic AI projects across the ecosystem
        </p>
      </div>
      <a
        href="https://aaif.io/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
      >
        <span class="text-xs text-neutral-400">Powered by</span>
        <img
          src="/images/reports/aaif-logo.svg"
          alt="AAIF Logo"
          class="w-24 md:w-32 h-auto"
        />
      </a>
    </div>

    <!-- Executive Summary -->
    <lfx-agentic-executive-summary
      :projects-data="projectsData"
      :contributors-data="contributorsData"
      :commits-data="commitsData"
      :research-data="researchData"
      :github-breadth-data="githubBreadthData"
      :cocomo-data="cocomoData"
      :time-to-close-data="timeToCloseData"
      :pr-time-to-resolve-data="prTimeToResolveData"
      :is-loading="isLoading"
    />

    <!-- Landscape Section -->
    <div class="flex flex-col gap-6">
      <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900">Landscape</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Research Chart -->
        <lfx-card class="p-4 md:p-6">
          <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900 mb-4">
            Agentic AI Research (arXiv Papers)
          </h3>
          <lfx-agentic-research-chart
            :data="researchData"
            :is-loading="researchLoading"
          />
        </lfx-card>

        <!-- GitHub Activity Table -->
        <lfx-card class="p-4 md:p-6">
          <h3 class="text-body-1 md:text-heading-4 font-secondary font-semibold text-neutral-900 mb-4">
            Agentic AI Activity on GitHub
          </h3>
          <lfx-agentic-github-activity-table
            :data="githubBreadthData"
            :is-loading="githubBreadthLoading"
          />
        </lfx-card>
      </div>
    </div>

    <!-- Projects Section -->
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-4">
        <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900">Projects</h2>
        <lfx-tabs
          v-model="projectsTab"
          :tabs="PROJECT_TABS"
          tab-style="pill"
          width-type="inline"
        />
      </div>

      <!-- Project Leaderboard -->
      <lfx-card
        v-if="projectsTab === 'leaderboard'"
        class="p-4 md:p-6"
      >
        <lfx-agentic-project-leaderboard
          :projects-data="projectsData"
          :stargazers-data="stargazersData"
          :forks-data="forksData"
          :commits-data="commitsData"
          :contributors-data="contributorsData"
          :merge-rate-data="mergeRateData"
          :time-to-close-data="timeToCloseData"
          :downloads-data="downloadsData"
          :cocomo-data="cocomoData"
          :pr-time-to-resolve-data="prTimeToResolveData"
          :vulnerabilities-data="totalVulnerabilitiesData"
          :new-contributors-90d-data="newContributors90dData"
          :docker-pulls-data="dockerPullsData"
          :dependent-repos-data="dependentReposData"
          :dependent-packages-data="dependentPackagesData"
          :github-releases-data="githubReleasesData"
          :issue-response-time-data="issueResponseTimeData"
          :no-response-share-data="noResponseShareData"
          :is-loading="isLoading"
        />
      </lfx-card>

      <!-- Metric Explorer -->
      <lfx-card
        v-if="projectsTab === 'explorer'"
        class="p-4 md:p-6"
      >
        <lfx-agentic-metric-explorer
          :projects-data="projectsData"
          :stargazers-data="stargazersData"
          :forks-data="forksData"
          :contributors-data="contributorsData"
          :downloads-data="downloadsData"
          :merge-rate-data="mergeRateData"
          :time-to-close-data="timeToCloseData"
          :pr-time-to-resolve-data="prTimeToResolveData"
          :total-vulnerabilities-data="totalVulnerabilitiesData"
          :cocomo-data="cocomoData"
          :github-releases-data="githubReleasesData"
          :commits-data="commitsData"
          :new-contributors-90d-data="newContributors90dData"
          :docker-pulls-data="dockerPullsData"
          :dependent-repos-data="dependentReposData"
          :dependent-packages-data="dependentPackagesData"
          :issue-response-time-data="issueResponseTimeData"
          :no-response-share-data="noResponseShareData"
          :is-loading="isLoading"
        />
      </lfx-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LfxAgenticExecutiveSummary from '../components/executive-summary.vue';
import LfxAgenticResearchChart from '../components/research-chart.vue';
import LfxAgenticGithubActivityTable from '../components/github-activity-table.vue';
import LfxAgenticProjectLeaderboard from '../components/project-leaderboard.vue';
import LfxAgenticMetricExplorer from '../components/metric-explorer.vue';
import { AGENTIC_AI_MOMENTUM_API_SERVICE } from '../services/agentic-ai-momentum.api.service';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';

// Fetch all data
const { data: projectsResponse, status: projectsStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchProjects();
const { data: stargazersResponse, status: stargazersStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchStargazers();
const { data: forksResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchForks();
const { data: commitsResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchCommits();
const { data: contributorsResponse, status: contributorsStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchContributors();
const { data: mergeRateResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchPullRequestMergeRate();
const { data: timeToCloseResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchIssueTimeToClose();
const { data: downloadsResponse, status: downloadsStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchPackageDownloads();
const { data: researchResponse, status: researchStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchResearchPapers();
const { data: githubBreadthResponse, status: githubBreadthStatus } =
  AGENTIC_AI_MOMENTUM_API_SERVICE.fetchGitHubEcosystemBreadth();
const { data: cocomoResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchCocomoValue();
const { data: newContributors90dResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchNewContributors90d();
const { data: dockerPullsResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchDockerHubPulls();
const { data: dependentReposResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchDependentRepos();
const { data: dependentPackagesResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchDependentPackages();
const { data: githubReleasesResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchGitHubReleases();
const { data: issueResponseTimeResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchIssueTimeToFirstResponse();
const { data: noResponseShareResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchIssueNoResponseShare();
const { data: prTimeToResolveResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchPullRequestTimeToResolve();
const { data: totalVulnerabilitiesResponse } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchTotalVulnerabilities();

// Extract data arrays
const projectsData = computed(() => projectsResponse.value?.data ?? []);
const stargazersData = computed(() => stargazersResponse.value?.data ?? []);
const forksData = computed(() => forksResponse.value?.data ?? []);
const commitsData = computed(() => commitsResponse.value?.data ?? []);
const contributorsData = computed(() => contributorsResponse.value?.data ?? []);
const mergeRateData = computed(() => mergeRateResponse.value?.data ?? []);
const timeToCloseData = computed(() => timeToCloseResponse.value?.data ?? []);
const downloadsData = computed(() => downloadsResponse.value?.data ?? []);
const researchData = computed(() => researchResponse.value?.data ?? []);
const githubBreadthData = computed(() => githubBreadthResponse.value?.data ?? []);
const cocomoData = computed(() => cocomoResponse.value?.data ?? []);
const newContributors90dData = computed(() => newContributors90dResponse.value?.data ?? []);
const dockerPullsData = computed(() => dockerPullsResponse.value?.data ?? []);
const dependentReposData = computed(() => dependentReposResponse.value?.data ?? []);
const dependentPackagesData = computed(() => dependentPackagesResponse.value?.data ?? []);
const githubReleasesData = computed(() => githubReleasesResponse.value?.data ?? []);
const issueResponseTimeData = computed(() => issueResponseTimeResponse.value?.data ?? []);
const noResponseShareData = computed(() => noResponseShareResponse.value?.data ?? []);
const prTimeToResolveData = computed(() => prTimeToResolveResponse.value?.data ?? []);
const totalVulnerabilitiesData = computed(() => totalVulnerabilitiesResponse.value?.data ?? []);

// Loading states
const isLoading = computed(
  () =>
    projectsStatus.value === 'pending' ||
    stargazersStatus.value === 'pending' ||
    contributorsStatus.value === 'pending' ||
    downloadsStatus.value === 'pending',
);

const researchLoading = computed(() => researchStatus.value === 'pending');
const githubBreadthLoading = computed(() => githubBreadthStatus.value === 'pending');

// Projects section tabs
const PROJECT_TABS = [
  { value: 'leaderboard', label: 'Project Leaderboard' },
  { value: 'explorer', label: 'Metric Explorer' },
];
const projectsTab = ref<'leaderboard' | 'explorer'>('leaderboard');
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticAiMomentumReport',
};
</script>
