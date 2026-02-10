<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card
    class="p-5 flex-1 flex flex-col justify-between h-full min-w-0 sm:hover:shadow-md sm:cursor-pointer transition-all !border-neutral-200"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleCardClick"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="size-9 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
          <lfx-icon
            v-if="config"
            :name="config.icon"
            :size="16"
          />
        </div>
        <div class="hidden sm:block">
          <lfx-icon-button
            v-show="isHovered"
            type="transparent"
            icon="share-nodes"
            @click.stop="handleShare"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <h1 class="text-xl font-bold font-secondary text-neutral-900">
          {{ config?.name }}
        </h1>
        <p class="text-xs text-neutral-500 w-full whitespace-pre-wrap mb-2">
          {{ config?.description }}
        </p>
      </div>

      <div class="flex-col gap-3 sm:flex hidden">
        <!-- Table header -->
        <lfx-table-header
          :config="config"
          :show-rank="false"
        />

        <component
          :is="config?.minimizedDataDisplay"
          v-for="item in leaderboards"
          :key="item.rank"
          :item="item"
        />
      </div>
      <div class="flex flex-wrap gap-3 sm:hidden">
        <component
          :is="project.githubHandle ? 'a' : 'div'"
          v-for="project of leaderboards"
          :key="project.slug"
          :href="project.githubHandle ? `https://github.com/${project.githubHandle}` : undefined"
          :target="project.githubHandle ? '_blank' : undefined"
          :rel="project.githubHandle ? 'noopener noreferrer' : undefined"
          class="inline-block"
        >
          <lfx-chip
            type="bordered"
            :class="['transition max-w-[350px]', project.githubHandle && 'hover:bg-neutral-100 cursor-pointer']"
          >
            <lfx-avatar
              :src="project.logoUrl"
              size="xsmall"
              type="organization"
              :aria-label="project.logoUrl && project.name"
            />
            <span class="truncate min-w-0 w-full">{{ project.name }}</span>
          </lfx-chip>
        </component>
      </div>
    </div>
    <lfx-button
      type="transparent"
      class="mt-6 w-full justify-center sm:!hidden"
      button-style="pill"
      @click="navigateToLeaderboard"
    >
      View leaderboard
    </lfx-button>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
// import LfxTableRow from './table-row.vue';
import LfxTableHeader from './table-header.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';

const router = useRouter();
const { openShareModal } = useShareStore();
const props = defineProps<{
  config: LeaderboardConfig;
  leaderboards: Leaderboard[];
}>();

const isHovered = ref(false);

const navigateToLeaderboard = () => {
  router.push({ name: LfxRoutes.LEADERBOARD, params: { key: props.config.key as string } });
};

const handleCardClick = (event: MouseEvent) => {
  // Only navigate on desktop (sm breakpoint = 640px)
  if (window.innerWidth >= 640) {
    // Don't navigate if clicking on the share button
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    navigateToLeaderboard();
  }
};

const handleShare = () => {
  const title = `LFX Insights | Leaderboard - ${props.config?.name}`;

  const baseUrl = window.location.href.replace(/\/+$/, '');
  const url = new URL(`${baseUrl}/leaderboards/${props.config.key}`);
  url.hash = '';

  openShareModal({
    url: url.toString(),
    title,
    area: props.config?.name,
  });
};
</script>
<script lang="ts">
export default {
  name: 'LfxLeaderboardCard',
};
</script>
