<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card
    class="p-5 flex-1 flex flex-col justify-between h-full min-w-0"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
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
        <lfx-icon-button
          v-show="isHovered"
          type="transparent"
          icon="share-nodes"
          size="small"
          @click="handleShare"
        />
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

        <lfx-table-row
          v-for="item in leaderboards"
          :key="item.rank"
          :item="item"
          :leaderboard-config="config"
          :is-small="true"
        />
      </div>
      <div class="flex flex-wrap gap-3 sm:hidden">
        <lfx-chip
          v-for="project of leaderboards"
          :key="project.slug"
          type="bordered"
          class="transition hover:bg-neutral-100 cursor-pointer"
          @click.prevent="router.push({ name: LfxRoutes.LEADERBOARD, params: { key: config.key as string } })"
        >
          <lfx-avatar
            :src="project.logoUrl"
            size="xsmall"
            type="organization"
            :aria-label="project.logoUrl && project.name"
          />
          {{ project.name }}
        </lfx-chip>
      </div>
    </div>
    <lfx-button
      type="transparent"
      class="mt-6 w-full justify-center"
      @click="router.push({ name: LfxRoutes.LEADERBOARD, params: { key: config.key as string } })"
    >
      View leaderboard
    </lfx-button>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxTableRow from './table-row.vue';
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

const handleShare = () => {
  const title = `${props.config?.name} Leaderboard | LFX Insights`;

  const url = new URL(window.location.href + `/${props.config.key}`);
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
