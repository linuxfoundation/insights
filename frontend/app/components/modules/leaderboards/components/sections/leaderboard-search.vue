<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    ref="containerRef"
    v-bind="$attrs"
  >
    <lfx-popover
      v-if="!inModal"
      v-model:visibility="isSearchOpen"
      placement="bottom-end"
      class="!w-full"
      :match-width="true"
    >
      <lfx-input
        v-model="searchQuery"
        placeholder="Search projects..."
        class="!border-none !bg-neutral-50 !rounded-full h-9 !shadow-none"
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
          <lfx-leaderboard-search-results
            :items="items"
            :is-success="isSuccess"
            :is-loading="isSearchPending && searchQuery !== ''"
            @item-click="handleItemClick"
          />
        </lfx-card>
      </template>
    </lfx-popover>

    <div v-else>
      <div class="relative">
        <lfx-input
          v-model="searchQuery"
          placeholder="Search projects..."
          class="!border-none !bg-white !rounded-full h-9 !shadow-none"
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

        <lfx-icon
          name="circle-xmark"
          type="regular"
          :size="14"
          class="text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
          @click="searchQuery = ''"
        />
      </div>
      <div
        v-if="searchQuery !== ''"
        class="h-px bg-neutral-100 w-full my-1"
      ></div>
      <lfx-leaderboard-search-results
        :items="items"
        :is-success="isSuccess"
        :is-loading="isSearchPending && searchQuery !== ''"
        @item-click="handleItemClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import { LEADERBOARD_API_SERVICE } from '../../services/leaderboard.api.service';
import LfxLeaderboardSearchResults from './leaderboard-search-results.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const props = defineProps<{
  config: LeaderboardConfig;
  inModal?: boolean;
}>();

const searchQuery = ref('');

const isSearchOpen = ref(false);

const containerRef = ref<HTMLElement | null>(null);

const focusInput = () => {
  if (containerRef.value) {
    const inputElement = containerRef.value.querySelector('input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.click(); // Also trigger click in case focus isn't enough
    }
  }
};

defineExpose({
  focusInput,
});

// Auto-focus on mount (when modal opens)
onMounted(() => {
  // Small delay to ensure the component is fully rendered in the modal
  setTimeout(() => {
    focusInput();
  }, 150);
});

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

const emit = defineEmits<{
  (e: 'itemClick', item: Leaderboard): void;
}>();

const handleItemClick = (item: Leaderboard) => {
  // Close the search popover
  isSearchOpen.value = false;
  searchQuery.value = '';

  // Emit the event to parent
  emit('itemClick', item);
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardSearch',
};
</script>
