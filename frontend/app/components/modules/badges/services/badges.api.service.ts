// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import type { ProjectBadge } from '../config/badge.types';
import { getBadgeTierFromPercentile } from '../config/badge.types';
import badgeConfigs from '../config/index.config';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import type { Pagination } from '~~/types/shared/pagination';

class BadgesApiService {
  fetchProjectBadges(projectSlug: ComputedRef<string | undefined>) {
    const queryKey = computed(() => [TanstackKey.PROJECT_BADGES, projectSlug.value]);

    const queryFn = async (): Promise<ProjectBadge[]> => {
      if (!projectSlug.value) {
        return [];
      }

      const response = await $fetch<Pagination<Leaderboard>>('/api/leaderboard', {
        params: {
          slug: projectSlug.value,
        },
      });

      return this.convertToBadges(response.data);
    };

    return useQuery<ProjectBadge[], Error>({
      queryKey,
      queryFn,
      enabled: computed(() => !!projectSlug.value),
    });
  }

  private convertToBadges(leaderboards: Leaderboard[]): ProjectBadge[] {
    const badges: ProjectBadge[] = [];

    for (const leaderboard of leaderboards) {
      // Calculate percentile using rank and totalCount from each leaderboard
      const percentile = (leaderboard.rank / leaderboard.totalCount) * 100;
      const tier = getBadgeTierFromPercentile(percentile);

      // Only include if project qualifies for a badge (top 50%)
      if (tier) {
        const config = badgeConfigs.find((c) => c.leaderboardKey === leaderboard.leaderboardType);
        if (config) {
          badges.push({
            config,
            tier,
            rank: leaderboard.rank,
            percentile: Math.ceil(percentile),
          });
        }
      }
    }

    // Sort badges by tier (black first, then gold, silver, bronze)
    const tierOrder = { black: 0, gold: 1, silver: 2, bronze: 3 };
    badges.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

    return badges;
  }
}

export const BADGES_API_SERVICE = new BadgesApiService();
