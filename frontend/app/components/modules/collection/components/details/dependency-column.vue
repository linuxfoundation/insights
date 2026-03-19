<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full flex flex-col gap-1.5 text-xs">
    <div class="flex items-center gap-1">
      <div class="flex items-center gap-1.5 text-neutral-900">
        <lfx-icon
          name="circle-small"
          type="solid"
          :class="`text-${dependencyColor(props.project.contributorDependencyPercentage, props.project.contributorDependencyCount)}-600`"
          :size="12"
        />
        {{ props.project.contributorDependencyCount }}
        {{ pluralize('contributor', props.project.contributorDependencyCount) }}
      </div>
      <div class="text-neutral-500">
        <span class="text-sm leading-none"> ・ </span>
        {{ props.project.contributorDependencyPercentage }}% of all contributions
      </div>
    </div>
    <div class="flex items-center gap-1">
      <div class="flex items-center gap-1.5 text-neutral-900">
        <lfx-icon
          name="circle-small"
          type="solid"
          :class="`text-${dependencyColor(props.project.organizationDependencyPercentage, props.project.organizationDependencyCount)}-600`"
          :size="12"
        />
        {{ props.project.organizationDependencyCount }}
        {{ pluralize('organization', props.project.organizationDependencyCount) }}
      </div>
      <div class="text-neutral-500">
        <span class="text-sm leading-none"> ・ </span>
        {{ props.project.organizationDependencyPercentage }}% of all contributions
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import pluralize from 'pluralize';
import type { ProjectInsights } from '~~/types/project';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';

const props = defineProps<{
  project: ProjectInsights;
}>();

const dependencyColor = (percentage: number, count: number): ProgressBarType => {
  if (percentage > 51) {
    switch (count) {
      case 1:
        return 'negative' as ProgressBarType;
      case 2:
      case 3:
      case 4:
        return 'warning' as ProgressBarType;
      default:
        return 'positive' as ProgressBarType;
    }
  }

  return 'positive' as ProgressBarType;
};
</script>

<script lang="ts">
export default {
  name: 'LfxDependencyColumn',
};
</script>
