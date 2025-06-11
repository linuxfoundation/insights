<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="!isPending && tableData?.length"
    class="lfx-table"
  >
    <div
      v-for="(row, index) in tableData"
      :key="index"
      class="lfx-table-row"
    >
      <div class="flex items-center gap-3">
        <div
          class="mr-1 text-neutral-400 text-xs"
        >
          #{{ index + 1 }}
        </div>
        <lfx-avatar
          :src="row.avatar"
          type="member"
        />
        <div
          class="text-ellipsis overflow-hidden"
          :title="row.displayName"
        >
          {{ row.displayName }}
        </div>
      </div>
      <div
        v-if="isFullList"
        class="basis-1/3 text-right text-xs text-neutral-500"
      >
        {{ formatNumber(row.activityCount) }}
      </div>
      <div
        v-if="!isFullList"
        class="basis-1/3 text-right text-xs text-neutral-500 hidden xl:block"
      >
        {{ formatNumber(row.activityCount) }} contributions
      </div>
    </div>

    <lfx-load-more
      v-if="showLoadMore"
      text="Loading contributors"
      :is-fetching-next-page="isFetchingNextPage"
      @load-more="loadMore"
    />
  </div>

</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '~/components/modules/explore/services/explore.api.service';
import type { Pagination } from '~~/types/shared/pagination';
import type { ExploreContributors } from '~~/types/explore/contributors';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxLoadMore from '~/components/modules/explore/components/load-more.vue';

const props = defineProps<{
  isFullList: boolean;
}>();

const {
  data,
  fetchNextPage,
  hasNextPage,
  isPending,
  isFetchingNextPage,
  // status,
  // error,
  suspense
} = EXPLORE_API_SERVICE.fetchTopContributors();

const tableData = computed(() => {
  if (props.isFullList) {
    return data.value?.pages.flatMap((p) => (p as Pagination<ExploreContributors>).data);
  }
  return (data.value?.pages[0] as Pagination<ExploreContributors>).data;
});

const loadMore = () => {
  fetchNextPage();
};

const showLoadMore = computed(() => hasNextPage.value && props.isFullList);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopContributors'
};
</script>
