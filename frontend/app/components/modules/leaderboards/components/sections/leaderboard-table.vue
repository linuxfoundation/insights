<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Leaderboard items -->
  <div
    class="flex flex-col items-start w-full"
    v-bind="containerProps"
  >
    <template v-if="!isForceLoading">
      <template
        v-for="{ data: item } in list"
        :key="item.rank"
      >
        <router-link
          v-if="item.slug"
          class="w-full"
          :to="`/project/${item.slug}`"
          :data-rank="item.rank"
        >
          <lfx-table-row
            :item="item"
            :leaderboard-config="leaderboardConfig"
            :is-small="false"
          />
        </router-link>

        <lfx-table-row
          v-else
          :item="item"
          :leaderboard-config="leaderboardConfig"
          :is-small="false"
          class="hover:!bg-white !cursor-default"
        />
      </template>
    </template>
    <template v-for="i in 100">
      <div
        v-if="isLoading || isForceLoading"
        :key="i"
        class="flex items-center p-3 w-full gap-3"
      >
        <div class="flex items-center justify-start">
          <div class="w-10 shrink-0 text-neutral-900 font-secondary">
            {{ (isForceLoading ? 0 : data.length) + i }}
          </div>
          <lfx-skeleton class="!w-8 !h-8 !rounded-sm" />
        </div>
        <div class="flex-1 shrink-0">
          <lfx-skeleton class="!w-2/4 !h-5" />
        </div>
        <lfx-skeleton class="!w-16 !h-5" />
      </div>
    </template>

    <lfx-button
      v-if="hasNextPage"
      type="transparent"
      button-style="pill"
      :loading="isLoading"
      class="mt-10 w-full justify-center"
      @click="emit('fetchNextPage')"
    >
      View more
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVirtualList } from '@vueuse/core';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxTableRow from './table-row.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxButton from '~/components/uikit/button/button.vue';

const props = defineProps<{
  leaderboardConfig: LeaderboardConfig;
  isLoading: boolean;
  isForceLoading: boolean;
  data: Leaderboard[];
  hasNextPage: boolean;
}>();

const dataList = computed(() => props.data);

const { list, containerProps } = useVirtualList(dataList, {
  itemHeight: 60,
});

const emit = defineEmits<{
  (e: 'fetchNextPage'): void;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardTable',
};
</script>
