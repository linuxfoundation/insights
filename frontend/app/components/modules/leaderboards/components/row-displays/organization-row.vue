<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="flex items-center w-full hover:bg-neutral-50 rounded-lg transition-all duration-300 sm:px-3 px-0 h-15">
    <!-- Rank -->
    <div class="w-10 shrink-0 text-neutral-900 font-secondary overflow-hidden overflow-ellipsis">
      {{ item.rank }}
    </div>

    <!-- Organization info -->
    <component
      :is="isTeamMember && item.slug ? nuxtLink : 'div'"
      :to="isTeamMember && item.slug ? { name: LfxRoutes.ORGANIZATION, params: { orgSlug: item.slug } } : undefined"
      class="flex-1 min-w-0 flex gap-3 items-center text-inherit no-underline"
      :class="isTeamMember && item.slug ? 'hover:text-brand-500 transition-colors cursor-pointer' : ''"
    >
      aaa
      <lfx-avatar
        :src="item.logoUrl"
        type="organization"
        :aria-label="item.logoUrl && item.name"
      />
      <p
        :title="item.name"
        class="text-base leading-5 font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
      >
        {{ item.name }}
      </p>
    </component>

    <!-- Stats -->
    <div class="w-1/4 shrink-0">
      <div
        class="text-base font-normal text-neutral-900 text-right w-full flex flex-col gap-2 items-end justify-center"
      >
        <numeric-data-display :data="item" />

        <numeric-trends :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import NumericDataDisplay from '../data-displays/numeric.vue';
import NumericTrends from '../trends/numeric-trends.vue';
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
  name: 'LfxOrganizationRowDisplay',
};
</script>
