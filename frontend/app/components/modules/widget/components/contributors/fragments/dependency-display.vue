<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-y-3 sm:flex-row justify-between sm:items-center mb-6">
    <div class="flex flex-row gap-3 items-center">
      <div class="dependency-display-avatars">
        <slot />
      </div>
      <div class="flex flex-col items-start">
        <div class="text-sm font-semibold">
          {{ props.topDependency.count }} {{ pluralize(props.label, props.topDependency.count) }}
        </div>
        <div :class="`text-body-1 text-${dependencyColor}-600`">
          {{ props.topDependency.percentage }}% of all contributions
        </div>
      </div>
    </div>
    <div class="flex sm:flex-col gap-x-3 sm:items-end">
      <!-- this is used to keep same spacing on small screens -->
      <div class="opacity-0 invisible sm:hidden">
        <slot />
      </div>
      <div>
        <div class="text-sm font-semibold">
          Other {{ props.otherDependency.count }} {{ pluralize(props.label, props.otherDependency.count) }}
        </div>
        <div class="text-body-1 text-neutral-500">
          {{ props.otherDependency.percentage }}% of all contributions
        </div>
      </div>
    </div>
  </div>
  <lfx-progress-bar
    :values="dependencyValues"
    :color="dependencyColor"
  />
  <span class="text-warning-600 text-negative-600 text-positive-600">
    <!-- tailwind classes don't show up unless they are used first -->
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import pluralize from "pluralize";
import type { Dependency, Contributor, Organization } from '~~/types/contributors/responses.types';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';

const props = withDefaults(
  defineProps<{
    topDependency: Dependency;
    otherDependency: Dependency;
    list: Contributor[] | Organization[];
    label: string;
  }>(),
  {
    topDependency: { count: 0, percentage: 0 },
    otherDependency: { count: 0, percentage: 0 }
  }
);

// This returns the percentage of each contributor/organization in the top
// The maximum number of contributors/organizations is 4
const dependencyValues = computed<number[]>(() => {
  if (
    props.list
    && props.list.length >= props.topDependency.count
    && props.topDependency.count < 5 // limit the number of split values to 5
  ) {
    return props.list
      .slice(0, props.topDependency.count)
      .map((contributor) => contributor.percentage || 0);
  }

  return [props.topDependency.percentage];
});

// This needs clarification on how to handle the colors
const dependencyColor = computed<ProgressBarType>(() => {
  if (props.topDependency.percentage > 51) {
    switch (props.topDependency.count) {
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
});
</script>

<script lang="ts">
export default {
  name: 'LfxDependencyDisplay'
};
</script>
