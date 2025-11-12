<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-start w-full pb-4">
    <div
      v-if="scrollTop < scrollThreshold"
      class="md:hidden block"
    >
      <router-link
        :to="{ name: LfxRoutes.LEADERBOARDS }"
        class="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 hover:font-medium transition-all duration-100"
      >
        <lfx-icon
          name="angle-left"
          :size="15"
        />
        All leaderboards
      </router-link>
    </div>
    <!-- Icon and Share button -->
    <div class="flex justify-between w-full items-start">
      <div class="flex transition-all ease-linear flex-col gap-3">
        <div
          :class="[scrollTop > scrollThreshold ? 'size-10' : 'size-12']"
          class="transition-all ease-linear bg-white border border-neutral-200 rounded-lg flex items-center justify-center"
        >
          <lfx-icon
            v-if="config"
            :name="config.icon"
            :size="scrollTop > scrollThreshold ? 20 : 24"
          />
        </div>

        <div class="flex flex-col gap-1">
          <h1
            :class="[scrollTop > scrollThreshold ? 'text-2xl ml-13 -mt-12' : 'text-3xl']"
            class="transition-all ease-linear font-light font-secondary text-neutral-900 md:block hidden"
          >
            {{ config?.name }}
          </h1>
          <!-- Sidebar navigation -->
          <div
            class="md:hidden flex justify-start"
            :class="[scrollTop > scrollThreshold ? 'ml-13 -mt-12' : '']"
          >
            <lfx-leaderboard-mobile-nav :leaderboard-key="config.key" />
          </div>
          <p
            :class="[scrollTop < scrollThreshold ? 'block' : 'hidden']"
            class="transition-all ease-linear text-sm text-neutral-500 w-full whitespace-pre-wrap min-h-10"
          >
            {{ config?.description }}
          </p>
        </div>
      </div>
      <div class="mt-1">
        <div class="md:block hidden">
          <lfx-button
            type="tertiary"
            size="small"
            button-style="pill"
            class="h-9"
            @click="handleShare"
          >
            <lfx-icon
              name="share-nodes"
              :size="16"
            />
            Share
          </lfx-button>
        </div>
        <div class="md:!hidden block">
          <lfx-icon-button
            icon="share-nodes"
            @click="handleShare"
          />
        </div>
      </div>
    </div>

    <div class="relative w-full md:block hidden">
      <lfx-leaderboard-search
        :config="config"
        class="rounded-full border border-solid border-neutral-200"
        @item-click="handleItemClick"
      />
    </div>
    <div class="md:hidden block w-full">
      <div
        class="rounded-full border border-solid border-neutral-200 cursor-pointer flex items-center gap-2 px-3 py-2"
        @click="isSearchOpen = true"
      >
        <lfx-icon
          name="search"
          :size="14"
          class="text-neutral-400"
        />
        <span class="text-sm text-neutral-400">Search projects...</span>
      </div>
    </div>
  </div>

  <lfx-modal
    v-model="isSearchOpen"
    width="100%"
    content-class="!max-w-full mx-4"
  >
    <div class="p-1 bg-white rounded-lg">
      <lfx-leaderboard-search
        ref="searchComponentRef"
        class="bg-white"
        in-modal
        :config="config"
        @item-click="handleItemClick"
      />
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxLeaderboardMobileNav from './leaderboard-mobile-nav.vue';
import LfxLeaderboardSearch from './leaderboard-search.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import useScroll from '~/components/shared/utils/scroll';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxModal from '~/components/uikit/modal/modal.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const { openShareModal } = useShareStore();
const props = defineProps<{
  config: LeaderboardConfig;
}>();

const { scrollTop } = useScroll();

const isSearchOpen = ref(false);

const scrollThreshold = 1;

const searchComponentRef = ref<InstanceType<typeof LfxLeaderboardSearch> | null>(null);

watch(isSearchOpen, (newValue) => {
  if (newValue) {
    // Use setTimeout with nextTick to ensure modal teleport has completed
    nextTick(() => {
      setTimeout(() => {
        searchComponentRef.value?.focusInput();
      }, 50);
    });
  }
});

const emit = defineEmits<{
  (e: 'itemClick', item: Leaderboard): void;
}>();

const handleItemClick = (item: Leaderboard) => {
  // Close the mobile search modal if it's open
  isSearchOpen.value = false;

  // Forward the event to parent component
  emit('itemClick', item);
};

const handleShare = () => {
  const title = `LFX Insights | Leaderboard - ${props.config?.name}`;

  const url = new URL(window.location.href);
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
  name: 'LfxLeaderboardDetailHeader',
};
</script>
