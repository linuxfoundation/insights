<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-load-state
    :status="status"
    :error="error"
    error-message="Error fetching top organizations"
    :is-empty="isEmpty"
  >
    <div
      v-if="!isPending && tableData?.length"
      class="lfx-table explore-tables mt-0.5"
    >
      <div
        v-for="(row, index) in tableData"
        :key="row.id"
        class="lfx-table-row text-inherit"
        :class="row.slug ? 'cursor-pointer' : ''"
      >
        <component
          :is="row.slug ? nuxtLink : 'div'"
          :to="row.slug ? { name: LfxRoutes.ORGANIZATION, params: { orgSlug: row.slug } } : undefined"
          class="name-col grow !gap-3 text-inherit no-underline"
          :class="row.slug ? 'hover:text-brand-500 transition-colors cursor-pointer' : ''"
        >
          <div class="mr-1 text-neutral-400 text-xs">#{{ index + 1 }}</div>
          <lfx-avatar
            :src="row.logo"
            type="organization"
            :aria-label="row.logo && row.displayName"
          />
          <div
            class="text-ellipsis overflow-hidden"
            :title="row.displayName"
          >
            {{ row.displayName }}
          </div>
        </component>
      </div>
    </div>
  </lfx-project-load-state>
</template>

<script setup lang="ts">
import { computed, resolveComponent, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '~/components/modules/explore/services/explore.api.service';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  isFullList?: boolean;
}>();

const { data, isPending, status, error, suspense } = EXPLORE_API_SERVICE.fetchTopOrganizations(
  props.isFullList ? 100 : 10,
);

const nuxtLink = resolveComponent('NuxtLink');
const tableData = computed(() => data.value);

const isEmpty = computed(() => isEmptyData(tableData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTopOrganizations',
};
</script>
