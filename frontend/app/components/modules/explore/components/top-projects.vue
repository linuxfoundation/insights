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
        <div class="name-col grow">
          <div
            class="mr-1 text-neutral-400 text-xs"
          >
            #{{ index + 1 }}
          </div>
          <lfx-avatar
            :src="row.logo"
            type="organization"
          />
          <div
            class="text-ellipsis overflow-hidden"
            :title="row.name"
          >
            {{ row.name }}
          </div>
        </div>
        <div
          v-if="isFullList"
          class="basis-1/5 text-right text-xs text-neutral-500"
        >
          {{ formatNumber(row.contributorCount) }}
        </div>
        <div
          v-if="isFullList"
          class="basis-1/5 text-right text-xs text-neutral-500"
        >
          {{ formatNumberCurrency(row.contributorCount, 'USD') }}
        </div>
        <div
          v-if="!isFullList"
          class="basis-1/5 justify-end text-xs text-neutral-500 flex"
        >
          <lfx-icon
            name="angle-right"
            :size="16"
          />
        </div>
      </div>
    </div>
  </lfx-project-load-state>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '~/components/modules/explore/services/explore.api.service';
import type { Pagination } from '~~/types/shared/pagination';
import type { Project } from '~~/types/project';
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import { formatNumber, formatNumberCurrency } from '~/components/shared/utils/formatter';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  isFullList: boolean;
}>();

const {
  data,
  isPending,
  status,
  error,
  suspense
} = EXPLORE_API_SERVICE.fetchTopProjects(props.isFullList ? 100 : 10);

const tableData = computed(() => data.value?.pages.flatMap((p) => (p as Pagination<Project>).data));

const isEmpty = computed(() => isEmptyData(tableData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopProjects'
};
</script>
