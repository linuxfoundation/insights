<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="flex items-center w-full">
    <!-- Organization info -->
    <component
      :is="isTeamMember ? nuxtLink : 'div'"
      :to="isTeamMember ? { name: LfxRoutes.ORGANIZATION, params: { orgSlug: item.slug } } : undefined"
      class="flex-1 min-w-0 flex gap-3 items-center text-inherit no-underline"
      :class="isTeamMember ? 'hover:text-brand-500 transition-colors cursor-pointer' : ''"
    >
      <lfx-avatar
        :src="item.logoUrl"
        type="organization"
        :aria-label="item.logoUrl && item.name"
      />
      <p
        :title="item.name"
        class="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-sm"
      >
        {{ item.name }}
      </p>
    </component>

    <!-- Stats -->
    <div class="w-1/4 shrink-0">
      <div class="flex flex-col gap-2 items-end justify-center font-normal text-neutral-900 text-right w-full text-sm">
        <numeric-data-display :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import NumericDataDisplay from '../data-displays/numeric.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { useAuth } from '~~/composables/useAuth';

defineProps<{
  item: Leaderboard;
  leaderboardConfig: LeaderboardConfig;
}>();

const nuxtLink = resolveComponent('NuxtLink');
const { user } = useAuth();
const isTeamMember = computed(() => !!user.value?.isLfInsightsTeamMember);
</script>

<script lang="ts">
export default {
  name: 'LfxOrganizationMinimizedRowDisplay',
};
</script>
