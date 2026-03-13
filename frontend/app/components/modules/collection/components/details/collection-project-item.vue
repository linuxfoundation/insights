<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center gap-2 py-4 text-neutral-900 text-sm cursor-pointer hover:bg-neutral-50 transition-all duration-300 px-2 -mx-2"
    @click="navigateToProject(props.project.slug)"
  >
    <div class="flex items-center gap-3 w-3/12 font-semibold">
      <lfx-organization-logo
        :src="props.project.logoUrl || ''"
        :is-lf="props.project.isLF"
        :alt="props.project.name"
      />
      {{ props.project.name }}
      <lfx-archived-tag
        v-if="status === 'archived'"
        :archived="true"
        label="Archived"
        type="project"
      />
    </div>
    <div class="w-2/12">
      <lfx-popover
        placement="top"
        trigger-event="hover"
        :allow-pass-through="true"
      >
        <lfx-health-score :score="project.healthScore" />
        <template #content>
          <lfx-health-score-details :project="props.project" />
        </template>
      </lfx-popover>
    </div>
    <div class="w-1/12">
      {{ formatNumber(props.project.contributorCount) }}
    </div>
    <div class="w-1/12">${{ formatNumberShort(props.project.softwareValue || 0) }}</div>
    <div class="w-3/12">
      <lfx-dependency-column :project="props.project" />
    </div>
    <div class="w-2/12 flex items-center gap-2">
      <!-- {{ formatNumber(props.project.organizationCount) }} -->
      <lfx-chip
        v-for="(count, tier) in badgeCountByTier"
        :key="count"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ProjectInsights } from '~~/types/project';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxHealthScore from '~/components/shared/components/health-score.vue';
import LfxHealthScoreDetails from '~/components/modules/collection/components/details/health-score-details.vue';
import LfxDependencyColumn from '~/components/modules/collection/components/details/dependency-column.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import badgeConfigs, {
  getBadgeTierFromPercentile,
  BadgeTier,
  type ProjectBadge,
} from '~/components/modules/badges/config/badge.config';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  project: ProjectInsights;
}>();

const router = useRouter();

// TODO: waiting on the backend to provide this
const status = computed(() => {
  return 'active';
});

const navigateToProject = (slug: string) => {
  router.push({ name: LfxRoutes.PROJECT, params: { slug } });
};

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
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionProjectItem',
};
</script>
