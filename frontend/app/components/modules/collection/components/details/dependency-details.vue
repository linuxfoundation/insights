<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden p-3 w-[32rem]">
    <!-- Contributor dependency -->
    <div class="flex flex-col gap-3">
      <p class="text-xs leading-4 font-semibold text-neutral-500">Contributor dependency</p>
      <div class="flex flex-col gap-2">
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <p class="text-sm font-semibold text-neutral-900">
              {{ formatNumber(props.project.contributorDependencyCount) }}
              {{ pluralize('contributor', props.project.contributorDependencyCount) }}
            </p>
            <p
              class="text-xs leading-4"
              :class="contributorDependencyTextColor"
            >
              {{ props.project.contributorDependencyPercentage }}% of all contributions
            </p>
          </div>
          <div class="flex flex-col text-right">
            <p class="text-sm font-semibold text-neutral-900">
              Other {{ formatNumber(otherContributorsCount) }}
              {{ pluralize('contributor', otherContributorsCount) }}
            </p>
            <p class="text-xs leading-4 text-neutral-500">{{ otherContributorsPercentage }}% of all contributions</p>
          </div>
        </div>
        <div class="flex gap-0.5 h-2 w-full">
          <div
            class="h-full rounded-xs"
            :class="contributorDependencyBarColor"
            :style="{ width: `${props.project.contributorDependencyPercentage}%` }"
          />
          <div class="h-full rounded-xs bg-neutral-200 flex-1" />
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-neutral-100 my-3" />

    <!-- Organization dependency -->
    <div class="flex flex-col gap-3">
      <p class="text-xs leading-4 font-semibold text-neutral-500">Organization dependency</p>
      <div class="flex flex-col gap-2">
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <p class="text-sm font-semibold text-neutral-900">
              {{ formatNumber(props.project.organizationDependencyCount) }}
              {{ pluralize('organization', props.project.organizationDependencyCount) }}
            </p>
            <p
              class="text-xs leading-4"
              :class="organizationDependencyTextColor"
            >
              {{ props.project.organizationDependencyPercentage }}% of all contributions
            </p>
          </div>
          <div class="flex flex-col text-right">
            <p class="text-sm font-semibold text-neutral-900">
              Other {{ formatNumber(otherOrganizationsCount) }}
              {{ pluralize('organization', otherOrganizationsCount) }}
            </p>
            <p class="text-xs leading-4 text-neutral-500">{{ otherOrganizationsPercentage }}% of all contributions</p>
          </div>
        </div>
        <div class="flex gap-0.5 h-2 w-full">
          <div
            class="h-full rounded-xs"
            :class="organizationDependencyBarColor"
            :style="{ width: `${props.project.organizationDependencyPercentage}%` }"
          />
          <div class="h-full rounded-xs bg-neutral-200 flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import pluralize from 'pluralize';
import type { ProjectInsights } from '~~/types/project';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = defineProps<{
  project: ProjectInsights;
}>();

const otherContributorsCount = computed(() => {
  return Math.max(0, props.project.contributorCount - props.project.contributorDependencyCount);
});

const otherContributorsPercentage = computed(() => {
  return Math.max(0, 100 - props.project.contributorDependencyPercentage);
});

const otherOrganizationsCount = computed(() => {
  return Math.max(0, props.project.organizationCount - props.project.organizationDependencyCount);
});

const otherOrganizationsPercentage = computed(() => {
  return Math.max(0, 100 - props.project.organizationDependencyPercentage);
});

type DependencyColorType = 'positive' | 'warning' | 'negative';

const getDependencyColor = (percentage: number, count: number): DependencyColorType => {
  if (percentage > 51) {
    switch (count) {
      case 1:
        return 'negative';
      case 2:
      case 3:
      case 4:
        return 'warning';
      default:
        return 'positive';
    }
  }
  return 'positive';
};

const contributorDependencyColor = computed(() => {
  return getDependencyColor(props.project.contributorDependencyPercentage, props.project.contributorDependencyCount);
});

const organizationDependencyColor = computed(() => {
  return getDependencyColor(props.project.organizationDependencyPercentage, props.project.organizationDependencyCount);
});

const contributorDependencyTextColor = computed(() => {
  const colorMap = {
    positive: 'text-positive-600',
    warning: 'text-warning-600',
    negative: 'text-negative-600',
  };
  return colorMap[contributorDependencyColor.value];
});

const organizationDependencyTextColor = computed(() => {
  const colorMap = {
    positive: 'text-positive-600',
    warning: 'text-warning-600',
    negative: 'text-negative-600',
  };
  return colorMap[organizationDependencyColor.value];
});

const contributorDependencyBarColor = computed(() => {
  const colorMap = {
    positive: 'bg-positive-500',
    warning: 'bg-warning-500',
    negative: 'bg-negative-500',
  };
  return colorMap[contributorDependencyColor.value];
});

const organizationDependencyBarColor = computed(() => {
  const colorMap = {
    positive: 'bg-positive-500',
    warning: 'bg-warning-500',
    negative: 'bg-negative-500',
  };
  return colorMap[organizationDependencyColor.value];
});
</script>

<script lang="ts">
export default {
  name: 'LfxDependencyDetails',
};
</script>
