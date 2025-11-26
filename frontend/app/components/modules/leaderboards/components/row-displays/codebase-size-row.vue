<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<!-- 
  This component is used to display a project row for the codebase size leaderboard.
  It's similar to the project integer row display, but does not show the trend.
 -->

<template>
  <router-link
    v-if="item.slug"
    class="w-full"
    :to="`/project/${item.slug}`"
    :data-rank="item.rank"
  >
    <div
      class="flex items-center w-full hover:bg-neutral-50 rounded-lg transition-all duration-300 cursor-pointer sm:px-3 px-0 h-15"
    >
      <!-- Rank -->
      <div class="w-10 shrink-0 text-neutral-900 font-secondary overflow-hidden overflow-ellipsis">
        {{ item.rank }}
      </div>

      <!-- Project info -->
      <div class="flex-1 min-w-0 flex gap-3 items-center">
        <lfx-organization-logo
          :src="item.logoUrl"
          :is-lf="item.isLF"
          :alt="item.name"
        />
        <p
          :title="item.name"
          class="text-base leading-5 font-medium text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
          @click="navigateToProject(item.slug)"
        >
          {{ item.name }}
        </p>
      </div>

      <!-- Stats -->
      <div class="w-1/4 shrink-0">
        <div
          class="text-base font-normal text-neutral-900 text-right w-full flex flex-col gap-2 items-end justify-center"
        >
          <numeric-data-display :data="item" />
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import NumericDataDisplay from '../data-displays/numeric.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const router = useRouter();

defineProps<{
  item: Leaderboard;
  leaderboardConfig: LeaderboardConfig;
}>();

const navigateToProject = (slug: string) => {
  if (!slug) {
    return;
  }
  router.push({ name: LfxRoutes.PROJECT, params: { slug } });
};
</script>

<script lang="ts">
export default {
  name: 'LfxCodebaseSizeRowDisplay',
};
</script>
