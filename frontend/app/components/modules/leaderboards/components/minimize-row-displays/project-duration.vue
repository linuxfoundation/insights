<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<!-- 
  This component is used to display a project row with a duration value in a leaderboard table row.
  It is used to display the project name, rank, and value in a leaderboard table row.
 -->

<template>
  <div class="flex items-center w-full">
    <!-- Project info -->
    <div class="flex-1 min-w-0 flex gap-3 items-center">
      <lfx-organization-logo
        :src="item.logoUrl"
        :is-lf="item.isLF"
        :alt="item.name"
      />
      <p
        :title="item.name"
        class="font-medium text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-full hover:underline cursor-pointer text-sm"
        @click.prevent.stop="navigateToProject(item.slug)"
      >
        {{ item.name }}
      </p>
      <lfx-archived-tag
        v-if="item.status === 'archived'"
        :archived="true"
        label="Archived"
        type="project"
      />
    </div>

    <!-- Stats -->
    <div class="w-1/4 shrink-0">
      <div class="flex flex-col gap-2 items-end justify-center font-normal text-neutral-900 text-right w-full text-sm">
        <duration-data-display :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import DurationDataDisplay from '../data-displays/duration.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';

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
  name: 'LfxProjectDurationMinimizedRowDisplay',
};
</script>
