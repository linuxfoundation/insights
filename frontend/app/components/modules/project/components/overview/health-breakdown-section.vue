<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
      <h2 class="text-xl leading-8 font-primary font-semibold text-neutral-900">Health breakdown</h2>
      <lfx-chip
        v-if="props.healthScoreV2 !== null"
        type="bordered"
        size="xsmall"
        class="flex items-center gap-1.5"
      >
        <span
          class="h-2 w-2 rounded-full shrink-0"
          :class="scoreDotColorClass"
        />
        <span class="font-semibold text-neutral-900">{{ scoreLabel }}</span>
        <span class="text-neutral-500">({{ props.healthScoreV2 }}/100)</span>
      </lfx-chip>
    </div>
    <p class="text-xs text-neutral-500 mb-4">
      Maintainer availability, known risks and supply chain posture, and whether the project is actively developed or
      appropriately stable.
    </p>

    <div
      v-if="isEmpty"
      class="flex items-center gap-1.5 text-xs text-neutral-500 mb-4"
    >
      <lfx-icon
        name="circle-info"
        :size="14"
        class="text-neutral-400 shrink-0"
      />
      <span>Health Score unavailable. All three categories have less than 40% signal coverage for this project.</span>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-stretch gap-1 p-1 bg-neutral-50 rounded-lg mb-4">
      <lfx-health-breakdown-category-card
        v-for="category in categories"
        :key="category.key"
        :name="category.name"
        :icon="category.icon"
        :score="category.score"
        :max-score="category.maxScore"
        :color="category.color"
        :description="category.description"
        :selected="selectedCategoryKey === category.key"
        @select="selectedCategoryKey = category.key"
      />
    </div>

    <div
      v-if="selectedCategoryRows.length > 0"
      class="mb-4"
    >
      <div
        v-for="row in selectedCategoryRows"
        :key="row.name"
        class="flex items-center gap-6 py-2 [&:not(:last-child)]:border-b border-neutral-200"
        :class="{ 'opacity-60': row.status === 'no-data' }"
      >
        <div class="flex items-center gap-4 w-60 shrink-0">
          <lfx-benchmark-icon
            :type="row.status"
            :size="12"
            :use-triangle="row.status === 'warning'"
            circle
          />
          <span class="text-sm font-semibold text-neutral-900">{{ row.name }}</span>
        </div>
        <p class="text-xs text-neutral-500">{{ row.description }}</p>
      </div>
    </div>

    <nuxt-link
      :to="{ name: selectedCategoryRoute.name }"
      class="flex justify-start"
    >
      <lfx-button
        type="transparent"
        button-style="pill"
      >
        View more in {{ selectedCategoryRoute.label }}
        <lfx-icon
          name="arrow-up-right"
          :size="12"
        />
      </lfx-button>
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LfxHealthBreakdownCategoryCard from './health-breakdown/category-card.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxBenchmarkIcon from '~/components/uikit/benchmarks/benchmark-icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { getHealthScoreV2Config } from '~~/config/trust-score';
import {
  getCategoryDescription,
  getCategoryScoreColor,
  getResponsivenessRow,
  getBusFactorRow,
  getOrgDiversityRow,
  getOpenVulnRow,
  getScorecardRow,
  getSecurityPracticesRow,
  getDependencyHealthRow,
  getReleaseCadenceRow,
  getCommitActivityRow,
  getIssueResolutionRow,
  getPrMergeRow,
} from '~~/config/health-breakdown-templates';
import type { HealthBreakdownResults } from '~~/types/overview/responses.types';

const props = defineProps<{
  healthScoreV2: number | null;
  healthLabel: string | null;
  maintainerHealthScoreV2: number | null;
  securitySupplyChainScoreV2: number | null;
  developmentActivityScoreV2: number | null;
  signals: HealthBreakdownResults | null;
}>();

const isEmpty = computed(() => props.healthScoreV2 === null);

const scoreLabel = computed(() => getHealthScoreV2Config(props.healthLabel).label);

const scoreDotColorClass = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return 'bg-positive-500';
  if (label === 'fair') return 'bg-accent-500';
  if (label === 'concerning') return 'bg-warning-500';
  return 'bg-negative-500';
});

const categories = computed(() => [
  {
    key: 'maintainer-health' as const,
    name: 'Maintainer Health',
    icon: 'heart-pulse',
    score: props.maintainerHealthScoreV2,
    maxScore: 40,
    color:
      props.maintainerHealthScoreV2 !== null
        ? getCategoryScoreColor('maintainer', props.maintainerHealthScoreV2)
        : 'normal',
    description: getCategoryDescription(
      'maintainer',
      props.maintainerHealthScoreV2,
      props.maintainerHealthScoreV2 !== null,
      props.signals,
    ),
  },
  {
    key: 'security-supply-chain' as const,
    name: 'Security & Supply Chain',
    icon: 'shield-check',
    score: props.securitySupplyChainScoreV2,
    maxScore: 35,
    color:
      props.securitySupplyChainScoreV2 !== null
        ? getCategoryScoreColor('security', props.securitySupplyChainScoreV2)
        : 'normal',
    description: getCategoryDescription(
      'security',
      props.securitySupplyChainScoreV2,
      props.securitySupplyChainScoreV2 !== null,
      props.signals,
    ),
  },
  {
    key: 'development-activity' as const,
    name: 'Development Activity',
    icon: 'laptop-code',
    score: props.developmentActivityScoreV2,
    maxScore: 25,
    color:
      props.developmentActivityScoreV2 !== null
        ? getCategoryScoreColor('development', props.developmentActivityScoreV2)
        : 'normal',
    description: getCategoryDescription(
      'development',
      props.developmentActivityScoreV2,
      props.developmentActivityScoreV2 !== null,
      props.signals,
    ),
  },
]);

const selectedCategoryKey = ref(categories.value[0].key);

const categoryRoutes: Record<(typeof categories.value)[number]['key'], { name: LfxRoutes; label: string }> = {
  'maintainer-health': { name: LfxRoutes.PROJECT_CONTRIBUTORS, label: 'Contributors' },
  'security-supply-chain': { name: LfxRoutes.PROJECT_SECURITY, label: 'Security & Best practices' },
  'development-activity': { name: LfxRoutes.PROJECT_DEVELOPMENT, label: 'Development' },
};

const selectedCategoryRoute = computed(() => categoryRoutes[selectedCategoryKey.value]);

const selectedCategoryRows = computed(() => {
  if (!props.signals) return [];
  const signals = props.signals;
  if (selectedCategoryKey.value === 'maintainer-health') {
    return [
      { name: 'Maintainer responsiveness', ...getResponsivenessRow(signals) },
      { name: 'Bus factor', ...getBusFactorRow(signals) },
      { name: 'Organization Diversity', ...getOrgDiversityRow(signals) },
    ];
  }
  if (selectedCategoryKey.value === 'security-supply-chain') {
    return [
      { name: 'Open vulnerabilities', ...getOpenVulnRow(signals) },
      { name: 'Security practices', ...getSecurityPracticesRow(signals) },
      { name: 'OpenSSF Scorecard', ...getScorecardRow(signals) },
      { name: 'Dependency health', ...getDependencyHealthRow(signals) },
    ];
  }
  return [
    { name: 'Release cadence', ...getReleaseCadenceRow(signals) },
    { name: 'Commit activity', ...getCommitActivityRow(signals) },
    { name: 'Issue resolution', ...getIssueResolutionRow(signals) },
    { name: 'PR merge health', ...getPrMergeRow(signals) },
  ];
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthBreakdownSection',
};
</script>
