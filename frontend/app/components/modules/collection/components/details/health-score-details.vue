<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden px-2 py-3 w-80">
    <div class="px-2">
      <p class="text-xs leading-4 font-semibold text-neutral-500">Health Score breakdown</p>
    </div>
    <div class="flex flex-col gap-1 mt-3">
      <nuxt-link
        v-for="item in healthScoreItems"
        :key="item.key"
        :to="{ name: item.route, params: { slug: props.project.slug } }"
        class="group flex flex-col gap-2 p-2 rounded-md hover:bg-neutral-50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <lfx-icon
              :name="item.icon"
              :size="15"
              class="text-neutral-900"
            />
            <span class="text-xs leading-5 text-neutral-900">
              <span class="font-semibold">{{ item.label }}</span>
              <span class="font-normal">・{{ getHealthLabel(item.score) }}</span>
            </span>
          </div>
          <lfx-icon
            name="arrow-up-right"
            :size="12"
            class="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <lfx-progress-bar
          size="small"
          :values="[item.score]"
          :color="getColor(item.score)"
        />
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
import type { ProjectInsights } from '~~/types/project';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  project: ProjectInsights;
}>();

interface HealthScoreItem {
  key: string;
  label: string;
  icon: string;
  score: number;
  route: LfxRoutes;
}

const healthScoreItems = computed<HealthScoreItem[]>(() => [
  {
    key: 'contributors',
    label: 'Contributors',
    icon: 'people-group',
    score: props.project.contributorHealthScore ?? 0,
    route: LfxRoutes.PROJECT_CONTRIBUTORS,
  },
  {
    key: 'popularity',
    label: 'Popularity',
    icon: 'fire',
    score: props.project.popularityHealthScore ?? 0,
    route: LfxRoutes.PROJECT_POPULARITY,
  },
  {
    key: 'development',
    label: 'Development',
    icon: 'code',
    score: props.project.developmentHealthScore ?? 0,
    route: LfxRoutes.PROJECT_DEVELOPMENT,
  },
  {
    key: 'security',
    label: 'Security & Best practices',
    icon: 'shield-check',
    score: props.project.securityHealthScore ?? 0,
    route: LfxRoutes.PROJECT_SECURITY,
  },
]);

const getColor = (value: number): ProgressBarType => {
  switch (true) {
    case value >= 75:
      return 'positive';
    case value >= 25:
      return 'warning';
    default:
      return 'negative';
  }
};

const getHealthLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Healthy';
  if (score >= 40) return 'Stable';
  if (score >= 20) return 'Unsteady';
  return 'Critical';
};
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreDetails',
};
</script>
