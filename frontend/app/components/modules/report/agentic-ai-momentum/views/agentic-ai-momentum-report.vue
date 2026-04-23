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
      :glance-data="glanceData ?? null"
      :research-data="researchData"
      :github-breadth-data="githubBreadthData"
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
          :tb-projects="tbProjects"
          :is-loading="isLoading"
        />
      </lfx-card>

      <!-- Metric Explorer -->
      <lfx-card
        v-if="projectsTab === 'explorer'"
        class="p-4 md:p-6"
      >
        <lfx-agentic-metric-explorer
          :tb-projects="tbProjects"
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
const { data: glanceData, status: glanceStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchGlance();
const { data: tbProjectsData, status: tbProjectsStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchTbProjects();
const { data: researchResponse, status: researchStatus } = AGENTIC_AI_MOMENTUM_API_SERVICE.fetchResearchPapers();
const { data: githubBreadthResponse, status: githubBreadthStatus } =
  AGENTIC_AI_MOMENTUM_API_SERVICE.fetchGitHubEcosystemBreadth();

// Extract data arrays
const tbProjects = computed(() => tbProjectsData.value ?? []);
const researchData = computed(() => researchResponse.value?.data ?? []);
const githubBreadthData = computed(() => githubBreadthResponse.value?.data ?? []);

// Loading states
const isLoading = computed(() => glanceStatus.value === 'pending' || tbProjectsStatus.value === 'pending');

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
