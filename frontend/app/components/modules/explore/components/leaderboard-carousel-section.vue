<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="flex flex-col gap-10">
    <!-- Carousel -->
    <!-- Header with title, description and navigation -->
    <lfx-carousel :value="leaderboardConfigs as unknown as CarouselData[]">
      <template #header>
        <div class="flex items-center justify-between w-full gap-4">
          <div class="flex flex-col gap-2 flex-1">
            <h2 class="text-2xl font-bold font-secondary text-neutral-900">Leaderboards</h2>
            <p class="text-sm text-neutral-500">
              Discover and compare open source projects across various performance metrics
            </p>
          </div>

          <div class="md:block hidden">
            <!-- All leaderboards button -->
            <nuxt-link :to="{ name: LfxRoutes.LEADERBOARDS }">
              <lfx-button type="transparent">
                <lfx-icon
                  name="grid-2"
                  :size="16"
                />
                <span class="md:text-base text-sm text-nowrap">All leaderboards</span>
              </lfx-button>
            </nuxt-link>
          </div>
        </div>
      </template>
      <template #item="{ data }">
        <lfx-leaderboard-card
          v-if="!isPending"
          :config="data as unknown as LeaderboardConfig"
          :leaderboards="getLeaderboardsByType((data as unknown as LeaderboardConfig)?.key)"
        />
        <div v-else>
          <lfx-skeleton class="!w-full !h-[440px] rounded-lg" />
        </div>
      </template>
      <template #footer>
        <div class="md:hidden flex justify-center">
          <!-- All leaderboards button -->
          <nuxt-link :to="{ name: LfxRoutes.LEADERBOARDS }">
            <lfx-button type="transparent">
              <lfx-icon
                name="grid-2"
                :size="16"
              />
              <span class="md:text-base text-sm text-nowrap">All leaderboards</span>
            </lfx-button>
          </nuxt-link>
        </div>
      </template>
    </lfx-carousel>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxLeaderboardCard from '../../leaderboards/components/sections/leaderboard-card.vue';
import { LEADERBOARD_API_SERVICE } from '../../leaderboards/services/leaderboard.api.service';
import leaderboardConfigs from '../../leaderboards/config/index.config';
import type { LeaderboardConfig } from '../../leaderboards/config/types/leaderboard.types';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { CarouselData } from '~/components/uikit/carousel/types/carousel.types';
import LfxCarousel from '~/components/uikit/carousel/carousel.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

// Fetch leaderboard data
const { data: leaderboardData, isPending } = LEADERBOARD_API_SERVICE.fetchLeaderboardLanding();

const leaderboardsByType = computed(() => {
  return LEADERBOARD_API_SERVICE.groupLeaderboardsByType(leaderboardData.value?.data || []);
});

const getLeaderboardsByType = (leaderboardType: string) => {
  return leaderboardsByType.value[leaderboardType] || [];
};
</script>

<script lang="ts">
export default {
  name: 'LfxExploreLeaderboardCarouselSection',
};
</script>
