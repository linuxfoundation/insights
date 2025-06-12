<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-load-state
    :status="status"
    :error="error"
    error-message="Error fetching top contributors"
    :is-empty="isEmpty"
  >
    <div
      v-if="!isPending && tableData?.length"
      class="lfx-table has-hover"
    >
      <div
        v-for="(row, index) in tableData"
        :key="index"
        class="lfx-table-row"
      >
        <div class="name-col grow !gap-3">
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
    </div>
  </lfx-project-load-state>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '~/components/modules/explore/services/explore.api.service';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import { formatNumber } from '~/components/shared/utils/formatter';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

const props = defineProps<{
  isFullList?: boolean;
}>();

const {
  data,
  isPending,
  status,
  error,
  suspense
} = EXPLORE_API_SERVICE.fetchTopContributors(props.isFullList ? 100 : 10);

const tableData = computed(() => data.value);

// const showLoadMore = computed(() => props.isFullList && tableData.value?.length && tableData.value.length < 100);
const isEmpty = computed(() => isEmptyData(tableData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopContributors'
};
</script>
