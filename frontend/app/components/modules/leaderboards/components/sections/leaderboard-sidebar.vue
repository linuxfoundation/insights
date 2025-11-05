<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex-col gap-4 md:flex hidden">
    <div class="flex flex-col gap-4">
      <router-link
        v-for="config in allLeaderboards"
        :key="config.key"
        :to="{ name: LfxRoutes.LEADERBOARD, params: { key: config.key as string } }"
        class="flex gap-2 items-center text-xs leading-4 cursor-pointer transition-colors hover:text-neutral-900 hover:font-medium"
        :class="isActiveLeaderboard(config.key) ? 'text-neutral-900 font-medium' : 'text-neutral-500 font-normal'"
      >
        <lfx-icon
          :name="config.icon"
          :size="14"
        />
        <span>{{ config.name }}</span>
      </router-link>
    </div>
  </div>
  <div class="md:hidden block">
    <lfx-dropdown
      placement="bottom-start"
      width="15rem"
    >
      <template #trigger>
        <lfx-dropdown-selector>
          <lfx-icon
            :name="activeLink?.icon || ''"
            :size="16"
            class="text-brand-500 font-black"
          />
          {{ activeLink?.name }}
        </lfx-dropdown-selector>
      </template>

      <template
        v-for="config in allLeaderboards"
        :key="config.key"
      >
        <router-link :to="{ name: LfxRoutes.LEADERBOARD, params: { key: config.key as string } }">
          <lfx-dropdown-item
            :value="config.key as string"
            :label="config.name"
          />
        </router-link>
      </template>
    </lfx-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import leaderboardConfigs from '../../config/index.config';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxDropdown from '~/components/uikit/dropdown/dropdown.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';

const props = defineProps<{
  leaderboardKey: string;
}>();

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
  name: 'LfxLeaderboardSidebar',
};
</script>
