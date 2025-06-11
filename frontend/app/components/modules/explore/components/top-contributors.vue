<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="!isPending && tableData?.length"
    class="flex gap-4 flex-col"
  >
    <div
      v-for="(row, index) in tableData"
      :key="index"
    >
      {{ row.displayName }}
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '~/components/modules/explore/services/explore.api.service';
import type { Pagination } from '~~/types/shared/pagination';
import type { ExploreContributors } from '~~/types/explore/contributors';

const props = defineProps<{
  isFullList: boolean;
}>();

const isFullListParam = computed(() => props.isFullList);
const {
  data,
  // hasNextPage,
  isPending,
  // status,
  // error,
  suspense
} = EXPLORE_API_SERVICE.fetchTopContributors(isFullListParam);

const tableData = computed(() => data.value?.pages.flatMap((p) => (p as Pagination<ExploreContributors>).data));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopContributors'
};
</script>
