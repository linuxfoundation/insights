<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Badge Layout - when badge data is provided -->

  <div
    v-if="hasBadge"
    style="
      width: 1200px;
      height: 630px;
      position: relative;
      display: flex;
      background: linear-gradient(118deg, #ecf4ff 0%, #ffffff 50%);
    "
  >
    <!-- Project Logo & Name -->
    <div style="position: absolute; left: 60px; top: 60px; display: flex; align-items: center; gap: 16px">
      <div
        style="
          width: 48px;
          height: 48px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        "
      >
        <img
          v-if="projectLogo"
          :src="projectLogo"
          alt="Project logo"
          style="width: 100%; height: 100%; object-fit: contain"
        />
      </div>
      <span style="font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 600; color: #000000">
        {{ truncatedProjectName }}
      </span>
    </div>

    <!-- Achievement Description -->
    <div
      style="
        position: absolute;
        left: 60px;
        top: 150px;
        width: 620px;
        font-family: 'Roboto Slab', serif;
        font-size: 40px;
        font-weight: 300;
        line-height: 1.25;
        color: #000000;
      "
    >
      {{ achievementText }}
    </div>

    <!-- Date -->
    <p
      style="
        position: absolute;
        left: 60px;
        top: 380px;
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 500;
        color: #000000;
      "
    >
      {{ formattedDate }}
    </p>

    <!-- LFX Insights Logo -->
    <img
      src="/images/og-image/lfx-insights-logo.png"
      alt="LFX Insights"
      style="position: absolute; left: 60px; top: 500px; width: 280px; height: 38px"
    />

    <!-- Badge Circle (dashed ring only) -->
    <div
      style="
        position: absolute;
        right: 100px;
        top: 50%;
        transform: translateY(-50%);
        width: 280px;
        height: 280px;
        border-radius: 50%;
      "
      :style="tierRingStyle"
    />
  </div>

  <!-- Default Project Layout - when no badge data -->
  <div
    v-else
    style="width: 1200px; height: 630px; position: relative; display: flex"
  >
    <img
      src="/images/og-image/bg.png"
      alt=""
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    />
    <!-- Title -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 80px;
        width: 807px;
        height: 70px;
        font-family: 'Roboto Slab', serif;
        font-size: 56px;
        font-weight: 700;
        line-height: 1.25;
        color: #0f172a;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      "
    >
      {{ truncatedProjectName }}
    </div>

    <!-- Description -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 174px;
        width: 807px;
        height: 108px;
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 36px;
        color: #0f172a;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      "
    >
      {{ truncatedDescription }}
    </div>

    <!-- Project Logo Box -->
    <div
      style="
        position: absolute;
        left: 960px;
        top: 80px;
        width: 160px;
        height: 160px;
        background: white;
        border: 1px solid #e2e8f0;
        padding: 10px;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <img
        v-if="projectLogo"
        :src="projectLogo"
        alt="Project logo"
        :width="140"
        :height="140"
        :style="{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
        }"
      />
    </div>

    <!-- LFX Insights Logo -->
    <img
      src="/images/og-image/lfx-insights-logo.png"
      alt="LFX Insights"
      style="position: absolute; left: 80px; top: 472px; width: 352px; height: 48px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import badgeConfigs, { getBadgeTierFromPercentile } from '~/components/modules/badges/config/index.config';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import type { Pagination } from '~~/types/shared/pagination';

const props = withDefaults(
  defineProps<{
    projectName?: string;
    projectLogo?: string;
    projectDescription?: string;
    projectSlug?: string;
    badge?: string;
  }>(),
  {
    projectName: '',
    projectLogo: '',
    projectDescription: '',
    projectSlug: '',
    badge: '',
  },
);

// Fetch badge data directly in the OG component
const { data: leaderboardData } = await useFetch<Pagination<Leaderboard>>('/api/leaderboard', {
  params: { slug: props.projectSlug },
  key: `og-badge-${props.projectSlug}-${props.badge}`,
  default: () => ({ data: [], pagination: { page: 1, perPage: 10, total: 0 } }),
});

// Find the specific leaderboard entry for this badge
const leaderboardEntry = computed(() => {
  if (!props.badge || !leaderboardData.value?.data) return null;
  return leaderboardData.value.data.find((l: Leaderboard) => l.leaderboardType === props.badge) || null;
});

// Calculate percentile and tier from leaderboard data
const calculatedPercentile = computed(() => {
  if (!leaderboardEntry.value) return 0;
  return Math.ceil((leaderboardEntry.value.rank / leaderboardEntry.value.totalCount) * 100);
});

const calculatedTier = computed(() => {
  if (!calculatedPercentile.value) return '';
  return getBadgeTierFromPercentile(calculatedPercentile.value) || '';
});

// Look up badge config from static configs using the badge key
const badgeConfig = computed(() => {
  if (!props.badge) return null;
  return badgeConfigs.find((c) => c.leaderboardKey === props.badge) || null;
});

// Determine if we have badge data
const hasBadge = computed(() => !!props.badge && !!badgeConfig.value && !!calculatedTier.value);

// Resolved values
const resolvedBadgeDescription = computed(() => badgeConfig.value?.description || '');
const resolvedPercentile = computed(() => calculatedPercentile.value || 1);
const resolvedTier = computed(() => calculatedTier.value || 'gold');

// Strip emojis and other problematic unicode characters that can crash resvg
const stripEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      '',
    )
    .trim();
};

const truncatedProjectName = computed(() => {
  const cleanName = stripEmojis(props.projectName);
  const maxLength = hasBadge.value ? 30 : 24;
  if (cleanName.length <= maxLength) {
    return cleanName;
  }
  return cleanName.substring(0, maxLength).trim() + '...';
});

const truncatedDescription = computed(() => {
  const cleanDescription = stripEmojis(props.projectDescription);
  const maxLength = 150;
  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }
  return cleanDescription.substring(0, maxLength).trim() + '...';
});

const achievementText = computed(() => {
  const text = `Top ${resolvedPercentile.value}% of open source projects for ${resolvedBadgeDescription.value?.toLowerCase() || 'this metric'}.`;
  return stripEmojis(text);
});

const formattedDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const tierColors: Record<string, string> = {
  bronze: '#f59e0b',
  silver: '#94a3b8',
  gold: '#eab308',
  black: '#475569',
};

const tierRingStyle = computed(() => {
  const color = tierColors[resolvedTier.value] || tierColors.bronze;
  return {
    border: `4px dashed ${color}`,
  };
});
</script>
