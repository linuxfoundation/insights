<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-neutral-900">Project Achievements</p>
      <nuxt-link
        :to="{ name: LfxRoutes.LEADERBOARDS }"
        class="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <lfx-icon
          name="arrow-up-right"
          :size="12"
        />
        <span>Leaderboards</span>
      </nuxt-link>
    </div>

    <!-- Badges Loading State -->
    <div
      v-if="isPending"
      class="flex items-center justify-between"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="p-skeleton !bg-transparent rounded-full"
      >
        <img
          src="/images/badges/mask.svg"
          alt=""
          class="size-13"
        />
      </div>
    </div>

    <!-- Badges Grid -->
    <div
      v-else
      class="flex flex-wrap items-start gap-x-4 gap-y-2"
    >
      <lfx-badges-item
        v-for="(badge, index) in badges"
        :key="index"
        :badge="badge"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { BADGES_API_SERVICE } from '../services/badges.api.service';
import LfxBadgesItem from './badges-item.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const { project } = storeToRefs(useProjectStore());

const projectSlug = computed(() => project.value?.slug);
const { data: badgesData, isPending } = BADGES_API_SERVICE.fetchProjectBadges(projectSlug);
const badges = computed(() => badgesData.value || []);
</script>

<script lang="ts">
export default {
  name: 'LfxBadges',
};
</script>
