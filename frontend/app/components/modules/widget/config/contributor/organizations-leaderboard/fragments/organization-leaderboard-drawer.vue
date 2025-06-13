<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-drawer
    v-model="isDrawerOpen"
    position="right"
  >
    <div class="relative flex flex-col justify-start h-full">
      <div class="pt-4 sm:pt-6 px-4 sm:px-6">
        <h3 class="text-heading-3 font-semibold font-secondary pb-3">{{ organizationsLeaderboard.name }}</h3>
        <p class="text-body-2 text-neutral-500 mb-6">
          {{ organizationsLeaderboard.description(project!) }}
          <a
            :href="organizationsLeaderboard.learnMoreLink"
            class="text-brand-500"
            target="_blank"
          >Learn more</a>
        </p>

        <hr>
      </div>
      <section
        class="mt-5 flex flex-col flex-grow overflow-auto"
      >
        <div
          class="mb-6 px-4 sm:px-6 pt-[1px]"
        >
          <lfx-activities-dropdown
            v-model="metric"
            full-width
          />
        </div>

        <lfx-project-load-state
          :status="isSuccess || isError ? 'success' : 'pending'"
          :error="isError"
          error-message="Error fetching organizations leaderboard"
          :is-empty="isEmpty"
        >
          <lfx-organizations-table
            :metric="metric"
            :organizations="organizations"
            :show-full-list="true"
            :has-next-page="hasNextPage"
            :is-fetching-next-page="isFetchingNextPage"
            @load-more="loadMore"
          />
        </lfx-project-load-state>
      </section>
    </div>
  </lfx-drawer>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 ref, computed, watch, onServerPrefetch
} from 'vue';
import { storeToRefs } from "pinia";
import type { OrganizationLeaderboard, Organization } from '~~/types/contributors/responses.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxActivitiesDropdown
  from "~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxOrganizationsTable
  from "~/components/modules/widget/components/contributors/fragments/organizations-table.vue";
import organizationsLeaderboard
  from '~/components/modules/widget/config/contributor/organizations-leaderboard/organizations-leaderboard.config';
import LfxDrawer from '~/components/uikit/drawer/drawer.vue';
import {TanstackKey} from "~/components/shared/types/tanstack";
import { CONTRIBUTORS_API_SERVICE } from '~~/app/components/modules/widget/services/contributors.api.service'

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const props = withDefaults(defineProps<{
  modelValue: boolean,
  selectedMetric?: string
}>(), {
  modelValue: false,
  selectedMetric: 'all:all'
});

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void
}>();

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const { project } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref(props.selectedMetric);
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);

const queryKey = computed(() => [
  TanstackKey.ORGANIZATIONS_LEADERBOARD,
  route.params.slug,
  platform,
  activityType,
  selectedRepository,
  startDate,
  endDate,
  metric
]);

const queryFn = computed(() => CONTRIBUTORS_API_SERVICE.organizationLeaderboardQueryFn(() => ({
  projectSlug: route.params.slug,
  platform: platform.value,
  activityType: activityType.value,
  repository: selectedRepository.value,
  startDate: startDate.value,
  endDate: endDate.value,
})));

const {
  data,
  isSuccess,
  isError,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  suspense
} = CONTRIBUTORS_API_SERVICE.fetchOrganizationLeaderboard(queryKey, queryFn);

const organizations = computed<Organization[]>(() => {
  if (!data.value) {
    return [];
  }
  return data.value?.pages.flatMap((page) => (page as OrganizationLeaderboard).data) || [];
});

const isEmpty = computed(() => isEmptyData(organizations.value as unknown as Record<string, unknown>[]));

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage();
  }
};

watch(props, () => {
  if (props.selectedMetric !== metric.value) {
    metric.value = props.selectedMetric;
  }
});

onServerPrefetch(async () => {
  await suspense()
})
</script>

<script lang="ts">
export default {
  name: 'LfxOrganizationLeaderboardDrawer'
};
</script>
