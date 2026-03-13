<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-2">
    <lfx-popover
      v-if="badges.length > 0"
      placement="top"
      trigger-event="hover"
      :allow-pass-through="true"
    >
      <div class="flex items-center gap-2">
        <lfx-chip
          v-for="(count, tier) in badgeCountByTier"
          :key="tier"
          :style="{ background: getBadgeColor(tier as BadgeTier) }"
          class="flex items-center gap-1"
        >
          <lfx-icon
            name="hexagon"
            :size="12"
            class="text-white"
          />
          <span class="text-white text-xs font-semibold">
            {{ count }}
          </span>
        </lfx-chip>
      </div>
      <template #content>
        <div class="bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden p-3 w-100">
          <div class="flex flex-col">
            <div
              v-for="(badge, index) in badges"
              :key="badge.config.leaderboardKey"
            >
              <div class="flex gap-3 items-start py-2">
                <!-- Badge Image -->
                <div class="shrink-0 size-13">
                  <img
                    :src="badge.config.badgeImages[badge.tier]"
                    :alt="badge.config.title"
                    class="size-13"
                  />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                  <p class="text-sm font-semibold text-neutral-900 truncate">
                    {{ badge.config.title }}
                  </p>
                  <p class="text-xs leading-4 text-neutral-500">
                    {{ getBadgeDescription(badge) }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 shrink-0">
                  <lfx-tooltip content="View leaderboard">
                    <nuxt-link
                      :to="{
                        name: LfxRoutes.LEADERBOARD,
                        params: { key: badge.config.leaderboardKey },
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
                      @click.stop="openShareModal(badge)"
                    />
                  </lfx-tooltip>
                </div>
              </div>

              <!-- Divider -->
              <div
                v-if="index < badges.length - 1"
                class="border-t border-neutral-100"
              />
            </div>
          </div>
        </div>
      </template>
    </lfx-popover>

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
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
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

const badgeCountByTier = computed(() => {
  return badges.value.reduce(
    (acc, badge) => {
      acc[badge.tier] = (acc[badge.tier] || 0) + 1;
      return acc;
    },
    {} as Record<BadgeTier, number>,
  );
});

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
