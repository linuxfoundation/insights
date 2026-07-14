<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center justify-end">
    <template v-if="badges.length > 0">
      <lfx-popover
        v-for="({ tier, count }, index) in badgeCountByTier"
        :key="tier"
        placement="top"
        trigger-event="hover"
        :allow-pass-through="true"
        class="relative"
        :class="index > 0 ? '-ml-1' : ''"
        :style="{ zIndex: badgeCountByTier.length - index }"
      >
        <div
          class="w-6 h-[23px] flex items-center justify-center"
          :style="{ clipPath: HEXAGON_CLIP_PATH, background: getBadgeColor(tier) }"
        >
          <span class="text-white text-xs font-semibold">{{ count }}</span>
        </div>
        <template #content>
          <div class="bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden p-3 w-100">
            <div class="flex flex-col">
              <div
                v-for="(tierBadge, tierBadgeIndex) in getBadgesByTier(tier)"
                :key="tierBadge.config.leaderboardKey"
              >
                <div class="flex gap-3 items-start py-2">
                  <!-- Badge Image -->
                  <div class="shrink-0 size-13">
                    <img
                      :src="tierBadge.config.badgeImages[tierBadge.tier]"
                      :alt="tierBadge.config.title"
                      class="size-13"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <p class="text-sm font-semibold text-neutral-900 truncate">
                      {{ tierBadge.config.title }}
                    </p>
                    <p class="text-xs leading-4 text-neutral-500">
                      {{ getBadgeDescription(tierBadge) }}
                    </p>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2 shrink-0">
                    <lfx-tooltip content="View leaderboard">
                      <nuxt-link
                        :to="{
                          name: LfxRoutes.LEADERBOARD,
                          params: { key: tierBadge.config.leaderboardKey },
                        }"
                        @click.stop
                      >
                        <lfx-icon-button
                          icon="trophy"
                          type="transparent"
                          size="small"
                        />
                      </nuxt-link>
                    </lfx-tooltip>
                    <lfx-tooltip content="Share achievement">
                      <lfx-icon-button
                        icon="share-nodes"
                        type="transparent"
                        size="small"
                        @click.stop="openShareModal(tierBadge)"
                      />
                    </lfx-tooltip>
                  </div>
                </div>

                <!-- Divider -->
                <div
                  v-if="tierBadgeIndex < getBadgesByTier(tier).length - 1"
                  class="border-t border-neutral-100"
                />
              </div>
            </div>
          </div>
        </template>
      </lfx-popover>
    </template>

    <!-- Share Modal -->
    <lfx-badges-share-modal
      v-if="selectedBadge"
      v-model="isShareModalOpen"
      :badge="selectedBadge"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ProjectInsights } from '~~/types/project';
import badgeConfigs, {
  getBadgeTierFromPercentile,
  BadgeTier,
  type ProjectBadge,
  tierConfigs,
} from '~/components/modules/badges/config/badge.config';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxBadgesShareModal from '~/components/modules/badges/components/share/badges-share-modal.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  project: ProjectInsights;
}>();

const isShareModalOpen = ref(false);
const selectedBadge = ref<ProjectBadge | null>(null);

const badges = computed<ProjectBadge[]>(() => {
  if (!props.project.achievements) return [];

  return props.project.achievements
    .map((achievement) => {
      const { leaderboardType, rank, totalCount } = achievement;
      const percentile = Math.round((rank / totalCount) * 100);

      if (percentile > 50) return null;

      const tier = getBadgeTierFromPercentile(percentile);
      if (!tier) return null;

      const config = badgeConfigs.find((c) => c.leaderboardKey === leaderboardType);
      if (!config) return null;

      return {
        config,
        tier,
        rank,
        percentile,
      };
    })
    .filter((badge): badge is ProjectBadge => badge !== null);
});

// Flat-top hexagon with rounded corners, matching the Collections v2 Achievements design (Figma node 3265-25479).
const HEXAGON_CLIP_PATH =
  "path('M5.02 2.61Q6.5 0 9.5 0L14.5 0Q17.5 0 18.98 2.61L22.52 8.89Q24 11.5 22.52 14.11L18.98 20.39Q17.5 23 14.5 23L9.5 23Q6.5 23 5.02 20.39L1.48 14.11Q0 11.5 1.48 8.89Z')";

const tierOrder: BadgeTier[] = [BadgeTier.BLACK, BadgeTier.GOLD, BadgeTier.SILVER, BadgeTier.BRONZE];

// One hexagon per tier the project has badges in, showing the count of achievements in that tier.
const badgeCountByTier = computed(() =>
  tierOrder
    .map((tier) => ({ tier, count: badges.value.filter((badge) => badge.tier === tier).length }))
    .filter(({ count }) => count > 0),
);

const getBadgeColor = (tier: BadgeTier) => {
  const radialGradient = `radial-gradient(107.08% 85.59% at 86.3% 87.5%, #0000003B 0%, #00000000 86.18%), 
      radial-gradient(83.94% 83.94% at 26.39% 20.83%, #FFFFFF96 0%, 
      #FFFFFF00 69.79%, #FFFFFF00 100%), `;
  switch (tier) {
    case BadgeTier.BLACK:
      return `${radialGradient} #000`;
    case BadgeTier.GOLD:
      return `${radialGradient} #D7A262`;
    case BadgeTier.SILVER:
      return `${radialGradient} #9FA3AD`;
    default: // BRONZE
      return `${radialGradient} #B97A50`;
  }
};

const getBadgesByTier = (tier: BadgeTier): ProjectBadge[] => {
  return badges.value.filter((badge) => badge.tier === tier);
};

const getBadgeDescription = (badge: ProjectBadge): string => {
  const tierConfig = tierConfigs[badge.tier];
  return `Top ${tierConfig.max}% of open source projects for ${badge.config.description.toLowerCase()}.`;
};

const openShareModal = (badge: ProjectBadge) => {
  selectedBadge.value = badge;
  isShareModalOpen.value = true;
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgeDetails',
};
</script>
