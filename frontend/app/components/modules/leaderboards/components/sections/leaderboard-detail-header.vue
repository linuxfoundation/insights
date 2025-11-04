<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-start w-full pb-4">
    <!-- Icon and Share button -->
    <div
      class="flex justify-between w-full"
      :class="[scrollTop > 50 ? 'items-center' : 'items-start']"
    >
      <div
        class="flex transition-all ease-linear"
        :class="[scrollTop > 50 ? 'flex-row gap-4' : 'flex-col gap-3']"
      >
        <div
          :class="[scrollTop > 50 ? 'size-10' : 'size-12']"
          class="transition-all ease-linear bg-white border border-neutral-200 rounded-lg flex items-center justify-center"
        >
          <lfx-icon
            v-if="config"
            :name="config.icon"
            :size="scrollTop > 50 ? 20 : 24"
          />
        </div>

        <div class="flex flex-col gap-1">
          <h1
            :class="[scrollTop > 50 ? 'text-2xl' : 'text-3xl']"
            class="transition-all ease-linear font-light font-secondary text-neutral-900"
          >
            {{ config?.name }}
          </h1>
          <p
            :class="[scrollTop < 50 ? 'block' : 'hidden']"
            class="transition-all ease-linear text-sm text-neutral-500 w-full whitespace-pre-wrap"
          >
            {{ config?.description }}
          </p>
        </div>
      </div>
      <lfx-button
        type="tertiary"
        size="small"
        class="h-9 rounded-full"
        @click="handleShare"
      >
        <lfx-icon
          name="share-nodes"
          :size="16"
        />
        Share
      </lfx-button>
    </div>

    <div class="relative w-full">
      <div class="w-full">
        <div class="rounded-full border border-solid border-neutral-200">
          <lfx-popover
            v-model:visibility="isSearchOpen"
            placement="bottom-end"
            class="!w-full"
            :match-width="true"
          >
            <lfx-input
              v-model="searchQuery"
              placeholder="Search projects..."
              class="!bg-neutral-50 !border-none !rounded-full h-9 !shadow-none"
            >
              <template #prefix>
                <lfx-icon
                  name="search"
                  type="regular"
                  :size="14"
                  class="text-neutral-400"
                />
              </template>
            </lfx-input>
            <template #content>
              <lfx-card
                class="w-full max-h-[65vh] overflow-y-auto"
                :class="[searchQuery !== '' ? 'p-1 shadow-lg' : '!border-none']"
              >
                <router-link
                  v-for="item in items"
                  :key="item.id"
                  :to="`/project/${item.slug}`"
                >
                  <div
                    class="flex items-center p-3 w-full hover:bg-neutral-50 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <!-- Project info -->
                    <div class="flex-1 min-w-0 flex gap-3 items-center">
                      <lfx-avatar
                        :src="item.logoUrl"
                        type="organization"
                        :aria-label="item.logoUrl && item.name"
                        size="small"
                      />
                      <p class="text-base leading-5 font-medium text-neutral-900 overflow-hidden overflow-ellipsis">
                        {{ item.name }}
                      </p>
                    </div>
                    <!-- Rank -->
                    <div class="text-neutral-500 text-sm">#{{ item.rank }}</div>
                  </div>
                </router-link>

                <div
                  v-if="items.length === 0 && isSuccess"
                  class="flex flex-col items-center py-20"
                >
                  <lfx-icon
                    name="face-monocle"
                    :size="40"
                    class="text-neutral-300"
                  />
                  <h3
                    class="text-center pt-5 text-heading-4 sm:text-heading-3 font-secondary font-bold text-neutral-500"
                  >
                    No projects found
                  </h3>
                </div>
                <div
                  v-if="isSearchPending && searchQuery !== ''"
                  class="flex items-center justify-between h-32 py-1"
                >
                  <lfx-spinner
                    :size="40"
                    class="text-neutral-300"
                  />
                </div>
              </lfx-card>
            </template>
          </lfx-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import { LEADERBOARD_API_SERVICE } from '../../services/leaderboard.api.service';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import useScroll from '~/components/shared/utils/scroll';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';

const props = defineProps<{
  config: LeaderboardConfig;
}>();

const { scrollTop } = useScroll();

const searchQuery = ref('');

const isSearchOpen = ref(false);

const handleShare = () => {
  // TODO: Implement share functionality
  if (navigator.share) {
    navigator.share({
      title: props.config?.name,
      text: props.config?.description,
      url: window.location.href,
    });
  }
};

watch(searchQuery, (newVal) => {
  isSearchOpen.value = newVal !== '';
});

const searchParams = computed(() => ({
  leaderboardType: props.config.key,
  search: searchQuery.value,
}));

const {
  data: searchData,
  isPending: isSearchPending,
  isSuccess,
} = LEADERBOARD_API_SERVICE.fetchLeaderboardDetailSearch(searchParams);

const items = computed(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  return searchData.value?.pages.flatMap((page: Pagination<Leaderboard>) => page.data) || [];
});
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetailHeader',
};
</script>
