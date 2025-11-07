<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center justify-between font-medium text-neutral-900 cursor-pointer"
    @click="isModalOpen = true"
  >
    <span
      :class="scrollTop > 0 ? 'text-xl' : 'text-2xl'"
      class="text-2xl font-light font-secondary text-neutral-900 mr-2 transition-all ease-linear"
      >{{ activeLink?.name }}</span
    >
    <lfx-icon
      name="angles-up-down"
      type="light"
      :size="14"
      class="text-neutral-500"
    />
  </div>

  <lfx-modal
    v-model="isModalOpen"
    width="100%"
    content-class="!max-w-full mx-4"
  >
    <div class="flex flex-col gap-1 px-4 py-2">
      <router-link
        v-for="config in allLeaderboards"
        :key="config.key"
        :to="{ name: LfxRoutes.LEADERBOARD, params: { key: config.key as string } }"
        class="flex items-center justify-between py-2 px-0"
        @click="isModalOpen = false"
      >
        <div class="flex items-center gap-2">
          <lfx-icon
            :name="config?.icon || ''"
            :size="14"
            type="light"
            :class="isActiveLeaderboard(config.key) ? 'text-neutral-900' : 'text-neutral-500'"
          />
          <span
            class="text-sm"
            :class="isActiveLeaderboard(config.key) ? 'font-medium text-neutral-900' : 'font-normal text-neutral-500'"
          >
            {{ config.name }}
          </span>
        </div>
        <lfx-icon
          v-if="isActiveLeaderboard(config.key)"
          name="check"
          :size="14"
          type="light"
          class="text-neutral-900"
        />
      </router-link>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import leaderboardConfigs from '../../config/index.config';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxModal from '~/components/uikit/modal/modal.vue';
import useScroll from '~/components/shared/utils/scroll';

const { scrollTop } = useScroll();

const props = defineProps<{
  leaderboardKey: string;
}>();

const isModalOpen = ref(false);

const allLeaderboards = computed(() => leaderboardConfigs);

const activeLink = computed(() => {
  return allLeaderboards.value.find((config) => config.key === props.leaderboardKey);
});

const isActiveLeaderboard = (key: string) => {
  return props.leaderboardKey === key;
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardMobileNav',
};
</script>
