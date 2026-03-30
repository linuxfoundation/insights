<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header: back button + project identity -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <button
        type="button"
        class="flex items-center gap-2 text-body-2 text-neutral-600 hover:text-neutral-900 transition-colors w-fit shrink-0"
        @click="emit('back')"
      >
        <lfx-icon
          name="arrow-left"
          :size="16"
        />
        <span>Back to Leaderboard</span>
      </button>

      <span class="hidden sm:inline text-neutral-300">|</span>

      <div class="flex items-center gap-3 min-w-0">
        <h2 class="text-heading-3 font-secondary font-semibold text-neutral-900 truncate">
          {{ project.name }}
        </h2>
        <span
          class="inline-flex shrink-0 px-2 py-1 rounded text-xs font-medium border"
          :class="[layerColors.bg, layerColors.text, layerColors.border]"
        >
          {{ project.layer }}
        </span>
        <a
          v-if="project.githubUrl"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
          :aria-label="`View ${project.name} on GitHub`"
        >
          <lfx-icon
            name="github"
            type="brands"
            :size="18"
          />
        </a>
      </div>
    </div>

    <!-- Tabs -->
    <lfx-tabs
      v-model="activeTab"
      :tabs="TABS"
      width-type="inline"
    />

    <!-- Tab: Adoption -->
    <div
      v-if="activeTab === 'adoption'"
      class="flex flex-col gap-6"
    >
      <!-- KPI cards -->
      <div
        v-if="isLoading"
        class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="bg-neutral-50 rounded-lg p-3 md:p-4"
        >
          <lfx-skeleton
            height="14px"
            width="60%"
            class="mb-2"
          />
          <lfx-skeleton
            height="28px"
            width="70%"
          />
        </div>
      </div>
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <div
          v-for="kpi in adoptionKpiCards"
          :key="kpi.label"
          class="bg-neutral-50 rounded-lg p-3 md:p-4 flex flex-col gap-1"
        >
          <div class="text-body-2 text-neutral-500">{{ kpi.label }}</div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-heading-3 font-bold text-neutral-900">{{ kpi.value }}</span>
            <span
              v-if="kpi.delta !== null && kpi.delta !== 0"
              class="text-xs font-medium"
              :class="kpi.delta > 0 ? 'text-positive-500' : 'text-negative-500'"
            >
              {{ kpi.delta > 0 ? '+' : '' }}{{ formatCompact(Math.abs(kpi.delta)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stars Over Time -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('stars')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Stars Over Time</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('stars') }"
          />
        </button>
        <div
          v-if="expandedCards.has('stars')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectStars.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No star data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="starsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Forks Over Time -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('forks')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Forks Over Time</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('forks') }"
          />
        </button>
        <div
          v-if="expandedCards.has('forks')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectForks.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No fork data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="forksChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Package Downloads -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('downloads')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Package Downloads</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('downloads') }"
          />
        </button>
        <div
          v-if="expandedCards.has('downloads')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectDownloadsChartData.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No download data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="downloadsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Dependent Repositories -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('dependentRepos')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Dependent Repositories</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('dependentRepos') }"
          />
        </button>
        <div
          v-if="expandedCards.has('dependentRepos')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectDependentRepos.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No dependent repository data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="dependentReposChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Dependent Packages -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('dependentPackages')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Dependent Packages</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('dependentPackages') }"
          />
        </button>
        <div
          v-if="expandedCards.has('dependentPackages')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectDependentPackages.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No dependent package data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="dependentPackagesChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Docker Hub Pulls -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('dockerPulls')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Docker Hub Pulls</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('dockerPulls') }"
          />
        </button>
        <div
          v-if="expandedCards.has('dockerPulls')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectDockerPulls.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No Docker Hub pull data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="dockerPullsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Docker Dependents -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('dockerDependents')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Docker Dependents</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('dockerDependents') }"
          />
        </button>
        <div
          v-if="expandedCards.has('dockerDependents')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectDockerDependents.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No Docker dependent data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="dockerDependentsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>
    </div>

    <!-- Tab: Community & Development -->
    <div
      v-if="activeTab === 'community'"
      class="flex flex-col gap-6"
    >
      <!-- KPI cards -->
      <div
        v-if="isLoading"
        class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="bg-neutral-50 rounded-lg p-3 md:p-4"
        >
          <lfx-skeleton
            height="14px"
            width="60%"
            class="mb-2"
          />
          <lfx-skeleton
            height="28px"
            width="70%"
          />
        </div>
      </div>
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <div
          v-for="kpi in communityKpiCards"
          :key="kpi.label"
          class="bg-neutral-50 rounded-lg p-3 md:p-4 flex flex-col gap-1"
        >
          <div class="text-body-2 text-neutral-500">{{ kpi.label }}</div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-heading-3 font-bold text-neutral-900">{{ kpi.value }}</span>
            <span
              v-if="kpi.delta !== null && kpi.delta !== 0"
              class="text-xs font-medium"
              :class="kpi.delta > 0 ? 'text-positive-500' : 'text-negative-500'"
            >
              {{ kpi.delta > 0 ? '+' : '' }}{{ formatCompact(Math.abs(kpi.delta)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Commits Over Time -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('commits')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Commits Over Time</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('commits') }"
          />
        </button>
        <div
          v-if="expandedCards.has('commits')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectCommits.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No commit data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="commitsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Contributors Over Time -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('contributors')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Contributors Over Time</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('contributors') }"
          />
        </button>
        <div
          v-if="expandedCards.has('contributors')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectContributors.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No contributor data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="contributorsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- New Contributors (Rolling 90d) -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('newContributors')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">New Contributors (Rolling 90d)</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('newContributors') }"
          />
        </button>
        <div
          v-if="expandedCards.has('newContributors')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectNewContributors.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No new contributor data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="newContributorsChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- GitHub Releases -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('releases')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">GitHub Releases (Cumulative)</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('releases') }"
          />
        </button>
        <div
          v-if="expandedCards.has('releases')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectGitHubReleases.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No release data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="githubReleasesChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>
    </div>

    <!-- Tab: Health -->
    <div
      v-if="activeTab === 'health'"
      class="flex flex-col gap-6"
    >
      <!-- KPI cards -->
      <div
        v-if="isLoading"
        class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="bg-neutral-50 rounded-lg p-3 md:p-4"
        >
          <lfx-skeleton
            height="14px"
            width="60%"
            class="mb-2"
          />
          <lfx-skeleton
            height="28px"
            width="70%"
          />
        </div>
      </div>
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <div
          v-for="kpi in healthKpiCards"
          :key="kpi.label"
          class="bg-neutral-50 rounded-lg p-3 md:p-4 flex flex-col gap-1"
        >
          <div class="text-body-2 text-neutral-500">{{ kpi.label }}</div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-heading-3 font-bold text-neutral-900">{{ kpi.value }}</span>
            <span
              v-if="kpi.delta !== null && kpi.delta !== 0"
              class="text-xs font-medium"
              :class="kpi.delta > 0 ? 'text-positive-500' : 'text-negative-500'"
            >
              {{ kpi.delta > 0 ? '+' : '' }}{{ formatCompact(Math.abs(kpi.delta)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- PR Merge Rate -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('mergeRate')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">PR Merge Rate</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('mergeRate') }"
          />
        </button>
        <div
          v-if="expandedCards.has('mergeRate')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectMergeRate.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No merge rate data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="mergeRateChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- PR Time to Resolve -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('prTimeToResolve')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">PR Time to Resolve (Avg Days)</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('prTimeToResolve') }"
          />
        </button>
        <div
          v-if="expandedCards.has('prTimeToResolve')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectPrTimeToResolve.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No PR time-to-resolve data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="prTimeToResolveChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Issue Activity (Open vs Closed) -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('issueActivity')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Issue Activity</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('issueActivity') }"
          />
        </button>
        <div
          v-if="expandedCards.has('issueActivity')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="issueActivityChartData.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No issue activity data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="issueActivityConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Issue Time to Close -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('timeToClose')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Issue Time to Close (Median Days)</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('timeToClose') }"
          />
        </button>
        <div
          v-if="expandedCards.has('timeToClose')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectTimeToClose.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No time-to-close data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="timeToCloseChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Issue Response Time -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('issueResponseTime')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Issue Response Time (Avg Days)</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('issueResponseTime') }"
          />
        </button>
        <div
          v-if="expandedCards.has('issueResponseTime')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectIssueResponseTime.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No issue response time data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="issueResponseTimeChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Issues Without Response -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('noResponse')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Issues Without Response (%)</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('noResponse') }"
          />
        </button>
        <div
          v-if="expandedCards.has('noResponse')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="projectNoResponseShare.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No no-response share data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="noResponseShareChartConfig" /></client-only>
          </div>
        </div>
      </lfx-card>

      <!-- Vulnerabilities -->
      <lfx-card class="overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between p-4 md:p-6 text-left"
          @click="toggleCard('vulnerabilities')"
        >
          <h3 class="text-body-1 font-secondary font-semibold text-neutral-900">Vulnerabilities</h3>
          <lfx-icon
            name="angle-down"
            :size="14"
            class="transition-transform duration-200 shrink-0 text-neutral-400"
            :class="{ 'rotate-180': expandedCards.has('vulnerabilities') }"
          />
        </button>
        <div
          v-if="expandedCards.has('vulnerabilities')"
          class="px-4 md:px-6 pb-4 md:pb-6"
        >
          <div
            v-if="isLoading"
            class="h-[280px]"
          >
            <lfx-skeleton
              height="100%"
              width="100%"
            />
          </div>
          <div
            v-else-if="vulnerabilitiesChartData.length === 0"
            class="flex items-center justify-center h-[280px] text-neutral-500 text-body-2"
          >
            No vulnerability data available.
          </div>
          <div
            v-else
            class="h-[280px]"
          >
            <client-only><lfx-chart :config="vulnerabilitiesConfig" /></client-only>
          </div>
        </div>
      </lfx-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { merge } from 'lodash-es';
import { getLayerColors } from '../config/layer-colors';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import type {
  ProjectLeaderboardRow,
  StargazersData,
  ForkData,
  CommitCountData,
  ContributorData,
  NewContributors90dData,
  PullRequestMergeRateData,
  IssueTimeToCloseData,
  PackageDownloadsData,
  CocomoValueData,
  DockerHubPullsData,
  DependentReposData,
  DependentPackagesData,
  DockerDependentsData,
  GitHubReleasesData,
  OpenIssuesData,
  ClosedIssuesData,
  IssueTimeToFirstResponseData,
  IssueNoResponseShareData,
  PullRequestTimeToResolveData,
  VulnerabilitiesData,
  FixedVulnerabilitiesData,
} from '~~/types/report/agentic-ai-momentum.types';

// ── Props & Emits ──────────────────────────────────────────────────────────────

const props = defineProps<{
  project: ProjectLeaderboardRow;
  stargazersData: StargazersData[];
  forksData: ForkData[];
  commitsData: CommitCountData[];
  contributorsData: ContributorData[];
  newContributors90dData: NewContributors90dData[];
  mergeRateData: PullRequestMergeRateData[];
  timeToCloseData: IssueTimeToCloseData[];
  downloadsData: PackageDownloadsData[];
  cocomoData: CocomoValueData[];
  dockerPullsData: DockerHubPullsData[];
  dependentReposData: DependentReposData[];
  dependentPackagesData: DependentPackagesData[];
  dockerDependentsData: DockerDependentsData[];
  githubReleasesData: GitHubReleasesData[];
  openIssuesData: OpenIssuesData[];
  closedIssuesData: ClosedIssuesData[];
  issueResponseTimeData: IssueTimeToFirstResponseData[];
  noResponseShareData: IssueNoResponseShareData[];
  prTimeToResolveData: PullRequestTimeToResolveData[];
  totalVulnerabilitiesData: VulnerabilitiesData[];
  fixedVulnerabilitiesData: FixedVulnerabilitiesData[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  back: [];
}>();

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
  { value: 'adoption', label: 'Adoption' },
  { value: 'community', label: 'Community & Development' },
  { value: 'health', label: 'Health' },
];

const activeTab = ref('adoption');

const TAB_DEFAULT_CHARTS: Record<string, string> = {
  adoption: 'stars',
  community: 'commits',
  health: 'mergeRate',
};

const expandedCards = ref<Set<string>>(new Set(['stars']));

watch(activeTab, (newTab) => {
  expandedCards.value = new Set([TAB_DEFAULT_CHARTS[newTab] ?? '']);
});

function toggleCard(key: string) {
  const s = new Set(expandedCards.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  expandedCards.value = s;
}

// ── Layer badge colors ─────────────────────────────────────────────────────────

const layerColors = computed(() => getLayerColors(props.project.layer));

// ── Data filtering ─────────────────────────────────────────────────────────────

const repo = computed(() => props.project.githubUrl ?? '');

const projectStars = computed(() =>
  props.stargazersData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectForks = computed(() =>
  props.forksData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectCommits = computed(() =>
  props.commitsData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectContributors = computed(() =>
  props.contributorsData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectNewContributors = computed(() =>
  props.newContributors90dData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectMergeRate = computed(() =>
  props.mergeRateData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectTimeToClose = computed(() =>
  props.timeToCloseData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectDownloadsRaw = computed(() =>
  props.downloadsData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectDockerPulls = computed(() =>
  props.dockerPullsData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectDependentRepos = computed(() =>
  props.dependentReposData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectDependentPackages = computed(() =>
  props.dependentPackagesData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectDockerDependents = computed(() =>
  props.dockerDependentsData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectGitHubReleases = computed(() =>
  props.githubReleasesData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectOpenIssues = computed(() =>
  props.openIssuesData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectClosedIssues = computed(() =>
  props.closedIssuesData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectIssueResponseTime = computed(() =>
  props.issueResponseTimeData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectNoResponseShare = computed(() =>
  props.noResponseShareData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectPrTimeToResolve = computed(() =>
  props.prTimeToResolveData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectTotalVulnerabilities = computed(() =>
  props.totalVulnerabilitiesData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const projectFixedVulnerabilities = computed(() =>
  props.fixedVulnerabilitiesData.filter((d) => d.repo === repo.value).sort((a, b) => a.month.localeCompare(b.month)),
);

const downloadMonths = computed(() => {
  const months = new Set(projectDownloadsRaw.value.map((d) => d.month));
  return Array.from(months).sort();
});

const downloadEcosystems = computed(() => {
  const ecosystems = new Set(projectDownloadsRaw.value.map((d) => d.ecosystem));
  return Array.from(ecosystems).sort();
});

// ── Format helpers ─────────────────────────────────────────────────────────────

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

// ── Derived scalars ────────────────────────────────────────────────────────────

const latestNewContrib = computed(() => projectNewContributors.value[projectNewContributors.value.length - 1]);

const latestDockerPulls = computed(() => {
  const sorted = projectDockerPulls.value.slice().sort((a, b) => b.month.localeCompare(a.month));
  return sorted[0]?.docker_hub_pulls ?? null;
});

const latestGithubReleases = computed(() => {
  const sorted = projectGitHubReleases.value.slice().sort((a, b) => b.month.localeCompare(a.month));
  return sorted[0]?.cumulative_releases ?? null;
});

const latestIssueResponseTime = computed(() => {
  const sorted = projectIssueResponseTime.value.slice().sort((a, b) => b.month.localeCompare(a.month));
  return sorted[0]?.issue_time_to_first_response_avg_days ?? null;
});

const latestNoResponseShare = computed(() => {
  const sorted = projectNoResponseShare.value.slice().sort((a, b) => b.month.localeCompare(a.month));
  return sorted[0]?.issue_share_no_response_30d ?? null;
});

// ── KPI cards (Adoption) ───────────────────────────────────────────────────────

const adoptionKpiCards = computed(() => [
  {
    label: 'Stars',
    value: props.project.stars !== null ? formatCompact(props.project.stars) : '-',
    delta: props.project.starsDelta,
  },
  {
    label: 'Forks',
    value: props.project.forks !== null ? formatCompact(props.project.forks) : '-',
    delta: props.project.forksDelta,
  },
  {
    label: 'Downloads',
    value: props.project.downloads !== null ? formatCompact(props.project.downloads) : '-',
    delta: props.project.downloadsDelta,
  },
  {
    label: 'Docker Hub Pulls',
    value: latestDockerPulls.value !== null ? formatCompact(latestDockerPulls.value) : '-',
    delta: null,
  },
]);

// ── KPI cards (Community & Development) ───────────────────────────────────────

const communityKpiCards = computed(() => [
  {
    label: 'Commits',
    value: props.project.commits !== null ? formatCompact(props.project.commits) : '-',
    delta: props.project.commitsDelta,
  },
  {
    label: 'Contributors',
    value: props.project.contributors !== null ? formatCompact(props.project.contributors) : '-',
    delta: props.project.contributorsDelta,
  },
  {
    label: 'New Contributors (90d)',
    value: latestNewContrib.value ? formatCompact(latestNewContrib.value.new_contributors_90d_count) : '-',
    delta: null,
  },
  {
    label: 'GitHub Releases',
    value: latestGithubReleases.value !== null ? formatCompact(latestGithubReleases.value) : '-',
    delta: null,
  },
]);

// ── KPI cards (Health) ─────────────────────────────────────────────────────────

const healthKpiCards = computed(() => [
  {
    label: 'Response Time',
    value: latestIssueResponseTime.value !== null ? `${latestIssueResponseTime.value.toFixed(1)}d` : '-',
    delta: null,
  },
  {
    label: 'Issue Close Time',
    value: props.project.timeToClose !== null ? `${props.project.timeToClose.toFixed(0)}d` : '-',
    delta: null,
  },
  {
    label: 'No-Response Issues',
    value: latestNoResponseShare.value !== null ? `${(latestNoResponseShare.value * 100).toFixed(0)}%` : '-',
    delta: null,
  },
  {
    label: 'PR Merge Rate',
    value: props.project.mergeRate !== null ? `${(props.project.mergeRate * 100).toFixed(0)}%` : '-',
    delta: null,
  },
]);

// ── Chart configs ──────────────────────────────────────────────────────────────

// Stars
const starsChartData = computed<ChartData[]>(() =>
  projectStars.value.map((d) => ({ key: d.month, values: [d.cumulative_stars] })),
);
const starsChartSeries: ChartSeries[] = [
  { name: 'Stars', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#d97706' },
];
const starsChartConfig = computed(() => getLineAreaChartConfig(starsChartData.value, starsChartSeries, 'monthly'));

// Forks
const forksChartData = computed<ChartData[]>(() =>
  projectForks.value.map((d) => ({ key: d.month, values: [d.cumulative_forks] })),
);
const forksChartSeries: ChartSeries[] = [
  { name: 'Forks', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#0068fa' },
];
const forksChartConfig = computed(() => getLineAreaChartConfig(forksChartData.value, forksChartSeries, 'monthly'));

// Downloads — one bar series per ecosystem
const DOWNLOAD_COLORS = ['#059669', '#0068fa', '#d97706', '#7c3aed', '#ef4444'];

const projectDownloadsChartData = computed<ChartData[]>(() =>
  downloadMonths.value.map((month) => ({
    key: month,
    values: downloadEcosystems.value.map((eco) => {
      const entry = projectDownloadsRaw.value.find((d) => d.month === month && d.ecosystem === eco);
      return entry?.download_counts ?? 0;
    }),
  })),
);

const downloadsChartSeries = computed<ChartSeries[]>(() =>
  downloadEcosystems.value.map((eco, idx) => ({
    name: eco,
    type: 'bar' as const,
    yAxisIndex: 0,
    dataIndex: idx,
    color: DOWNLOAD_COLORS[idx % DOWNLOAD_COLORS.length] ?? '#6b7280',
  })),
);

const downloadsChartConfig = computed(() => {
  const base = getBarChartConfig(projectDownloadsChartData.value, downloadsChartSeries.value, 'monthly');
  return merge({}, base, {
    legend: {
      show: true,
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: lfxColors.neutral[700] },
    },
    grid: { bottom: '18%' },
  });
});

// Docker Hub Pulls
const dockerPullsChartData = computed<ChartData[]>(() =>
  projectDockerPulls.value.map((d) => ({ key: d.month, values: [d.docker_hub_pulls] })),
);
const dockerPullsChartSeries: ChartSeries[] = [
  { name: 'Docker Hub Pulls', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#0891b2' },
];
const dockerPullsChartConfig = computed(() =>
  getLineAreaChartConfig(dockerPullsChartData.value, dockerPullsChartSeries, 'monthly'),
);

// Dependent Repositories
const dependentReposChartData = computed<ChartData[]>(() =>
  projectDependentRepos.value.map((d) => ({ key: d.month, values: [d.dependent_repos_count] })),
);
const dependentReposChartSeries: ChartSeries[] = [
  { name: 'Dependent Repos', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#7c3aed' },
];
const dependentReposChartConfig = computed(() =>
  getLineAreaChartConfig(dependentReposChartData.value, dependentReposChartSeries, 'monthly'),
);

// Dependent Packages
const dependentPackagesChartData = computed<ChartData[]>(() =>
  projectDependentPackages.value.map((d) => ({
    key: d.month,
    values: [d.dependent_packages_count],
  })),
);
const dependentPackagesChartSeries: ChartSeries[] = [
  { name: 'Dependent Packages', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#d97706' },
];
const dependentPackagesChartConfig = computed(() =>
  getLineAreaChartConfig(dependentPackagesChartData.value, dependentPackagesChartSeries, 'monthly'),
);

// Docker Dependents
const dockerDependentsChartData = computed<ChartData[]>(() =>
  projectDockerDependents.value.map((d) => ({
    key: d.month,
    values: [d.docker_dependents_count],
  })),
);
const dockerDependentsChartSeries: ChartSeries[] = [
  { name: 'Docker Dependents', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#db2777' },
];
const dockerDependentsChartConfig = computed(() =>
  getLineAreaChartConfig(dockerDependentsChartData.value, dockerDependentsChartSeries, 'monthly'),
);

// Commits
const commitsChartData = computed<ChartData[]>(() =>
  projectCommits.value.map((d) => ({ key: d.month, values: [d.cumulative_commits] })),
);
const commitsChartSeries: ChartSeries[] = [
  { name: 'Commits', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#7c3aed' },
];
const commitsChartConfig = computed(() =>
  getLineAreaChartConfig(commitsChartData.value, commitsChartSeries, 'monthly'),
);

// Contributors
const contributorsChartData = computed<ChartData[]>(() =>
  projectContributors.value.map((d) => ({ key: d.month, values: [d.cumulative_contributors] })),
);
const contributorsChartSeries: ChartSeries[] = [
  { name: 'Contributors', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#0068fa' },
];
const contributorsChartConfig = computed(() =>
  getLineAreaChartConfig(contributorsChartData.value, contributorsChartSeries, 'monthly'),
);

// New Contributors (bar)
const newContributorsChartData = computed<ChartData[]>(() =>
  projectNewContributors.value.map((d) => ({
    key: d.month,
    values: [d.new_contributors_90d_count],
  })),
);
const newContributorsChartSeries: ChartSeries[] = [
  { name: 'New Contributors (90d)', type: 'bar', yAxisIndex: 0, dataIndex: 0, color: '#059669' },
];
const newContributorsChartConfig = computed(() =>
  getBarChartConfig(newContributorsChartData.value, newContributorsChartSeries, 'monthly'),
);

// GitHub Releases
const githubReleasesChartData = computed<ChartData[]>(() =>
  projectGitHubReleases.value.map((d) => ({ key: d.month, values: [d.cumulative_releases] })),
);
const githubReleasesChartSeries: ChartSeries[] = [
  { name: 'Releases', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#059669' },
];
const githubReleasesChartConfig = computed(() =>
  getLineAreaChartConfig(githubReleasesChartData.value, githubReleasesChartSeries, 'monthly'),
);

// Merge Rate (percentage)
const mergeRateChartData = computed<ChartData[]>(() =>
  projectMergeRate.value.map((d) => ({
    key: d.month,
    values: [parseFloat((d.pr_merge_rate * 100).toFixed(1))],
  })),
);
const mergeRateChartSeries: ChartSeries[] = [
  { name: 'Merge Rate (%)', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#d97706' },
];
const mergeRateChartConfig = computed(() =>
  getLineAreaChartConfig(mergeRateChartData.value, mergeRateChartSeries, 'monthly', (v: number) => `${v}%`),
);

// Time to Close (days)
const timeToCloseChartData = computed<ChartData[]>(() =>
  projectTimeToClose.value.map((d) => ({
    key: d.month,
    values: [parseFloat(d.median_time_to_close_days.toFixed(1))],
  })),
);
const timeToCloseChartSeries: ChartSeries[] = [
  { name: 'Median Days to Close', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#059669' },
];
const timeToCloseChartConfig = computed(() =>
  getLineAreaChartConfig(timeToCloseChartData.value, timeToCloseChartSeries, 'monthly', (v: number) => `${v}d`),
);

// Issue Activity (dual-series: open + closed)
const issueActivityChartData = computed<ChartData[]>(() => {
  const months = [
    ...new Set([...projectOpenIssues.value.map((d) => d.month), ...projectClosedIssues.value.map((d) => d.month)]),
  ].sort();
  return months.map((month) => ({
    key: month,
    values: [
      projectOpenIssues.value.find((d) => d.month === month)?.open_issues_count ?? 0,
      projectClosedIssues.value.find((d) => d.month === month)?.closed_issues_count ?? 0,
    ],
  }));
});
const issueActivitySeries: ChartSeries[] = [
  { name: 'Open Issues', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#ef4444' },
  { name: 'Closed Issues', type: 'line', yAxisIndex: 0, dataIndex: 1, color: '#059669' },
];
const issueActivityConfig = computed(() => {
  const base = getLineAreaChartConfig(issueActivityChartData.value, issueActivitySeries, 'monthly');
  return merge({}, base, {
    legend: {
      show: true,
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: lfxColors.neutral[700] },
    },
    grid: { bottom: '18%' },
  });
});

// Vulnerabilities (dual-series: total + fixed)
const vulnerabilitiesChartData = computed<ChartData[]>(() => {
  const months = [
    ...new Set([
      ...projectTotalVulnerabilities.value.map((d) => d.month),
      ...projectFixedVulnerabilities.value.map((d) => d.month),
    ]),
  ].sort();
  return months.map((month) => ({
    key: month,
    values: [
      projectTotalVulnerabilities.value.find((d) => d.month === month)?.vulnerabilities_count ?? 0,
      projectFixedVulnerabilities.value.find((d) => d.month === month)?.fixed_vulnerabilities_count ?? 0,
    ],
  }));
});
const vulnerabilitiesSeries: ChartSeries[] = [
  { name: 'Total Vulnerabilities', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#ef4444' },
  { name: 'Fixed Vulnerabilities', type: 'line', yAxisIndex: 0, dataIndex: 1, color: '#059669' },
];
const vulnerabilitiesConfig = computed(() => {
  const base = getLineAreaChartConfig(vulnerabilitiesChartData.value, vulnerabilitiesSeries, 'monthly');
  return merge({}, base, {
    legend: {
      show: true,
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: lfxColors.neutral[700] },
    },
    grid: { bottom: '18%' },
  });
});

// Issue Response Time
const issueResponseTimeChartData = computed<ChartData[]>(() =>
  projectIssueResponseTime.value.map((d) => ({
    key: d.month,
    values: [parseFloat(d.issue_time_to_first_response_avg_days.toFixed(1))],
  })),
);
const issueResponseTimeChartSeries: ChartSeries[] = [
  { name: 'Avg Response Time (days)', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#0068fa' },
];
const issueResponseTimeChartConfig = computed(() =>
  getLineAreaChartConfig(
    issueResponseTimeChartData.value,
    issueResponseTimeChartSeries,
    'monthly',
    (v: number) => `${v}d`,
  ),
);

// Issues Without Response
const noResponseShareChartData = computed<ChartData[]>(() =>
  projectNoResponseShare.value.map((d) => ({
    key: d.month,
    values: [parseFloat((d.issue_share_no_response_30d * 100).toFixed(1))],
  })),
);
const noResponseShareChartSeries: ChartSeries[] = [
  { name: 'No-Response Issues (%)', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#dc2626' },
];
const noResponseShareChartConfig = computed(() =>
  getLineAreaChartConfig(noResponseShareChartData.value, noResponseShareChartSeries, 'monthly', (v: number) => `${v}%`),
);

// PR Time to Resolve
const prTimeToResolveChartData = computed<ChartData[]>(() =>
  projectPrTimeToResolve.value.map((d) => ({
    key: d.month,
    values: [parseFloat(d.median_time_to_resolve_days.toFixed(1))],
  })),
);
const prTimeToResolveChartSeries: ChartSeries[] = [
  { name: 'Avg PR Resolve Time (days)', type: 'line', yAxisIndex: 0, dataIndex: 0, color: '#7c3aed' },
];
const prTimeToResolveChartConfig = computed(() =>
  getLineAreaChartConfig(prTimeToResolveChartData.value, prTimeToResolveChartSeries, 'monthly', (v: number) => `${v}d`),
);
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticProjectMetrics',
};
</script>
