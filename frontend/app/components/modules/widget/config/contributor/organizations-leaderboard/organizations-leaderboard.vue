<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section
    :class="props.snapshot ? 'mt-2' : 'mt-5'"
  >
    <div
      :class="props.snapshot ? 'mb-5' : 'mb-6'"
    >
      <lfx-activities-dropdown
        v-model="model.metric"
        full-width
        :snapshot="props.snapshot"
      />
    </div>

    <lfx-project-load-state
      :status="isSuccess || isError ? 'success' : 'pending'"
      :error="isError"
      error-message="Error fetching organizations leaderboard"
      :is-empty="isEmpty"
    >
      <lfx-organizations-table
        :metric="model.metric"
        :organizations="organizations.data"
        :show-percentage="true"
      />

      <div
        v-if="!props.snapshot"
        class="mt-5 flex flex-row justify-center"
      >
        <lfx-button
          type="transparent"
          @click="isDrawerOpened = true"
        >
          All organizations
        </lfx-button>
      </div>
    </lfx-project-load-state>
    <lfx-organization-leaderboard-drawer
      v-model="isDrawerOpened"
      :selected-metric="model.metric"
    />
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 ref, computed, onServerPrefetch, watch
} from 'vue';
import { storeToRefs } from "pinia";
import LfxOrganizationLeaderboardDrawer from './fragments/organization-leaderboard-drawer.vue';
import type { OrganizationLeaderboard } from '~~/types/contributors/responses.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxButton from "~/components/uikit/button/button.vue";
import LfxActivitiesDropdown
  from "~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxOrganizationsTable
  from "~/components/modules/widget/components/contributors/fragments/organizations-table.vue";
import {TanstackKey} from "~/components/shared/types/tanstack";
import { CONTRIBUTORS_API_SERVICE } from '~~/app/components/modules/widget/services/contributors.api.service'
import {Widget} from "~/components/modules/widget/types/widget";

interface OrganizationsLeaderboardModel {
  metric: string;
}

const props = defineProps<{
  modelValue: OrganizationsLeaderboardModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: OrganizationsLeaderboardModel): void}>()

const model = computed<OrganizationsLeaderboardModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const platform = computed(() => model.value?.metric?.split(':')[0]);
const activityType = computed(() => model.value?.metric?.split(':')[1]);
const isDrawerOpened = ref(false);

const queryKey = computed(() => [
  TanstackKey.ORGANIZATIONS_LEADERBOARD,
  route.params.slug,
  platform,
  activityType,
  selectedRepository,
  startDate,
  endDate,
  model.value.metric
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
  status,
  suspense,
} = CONTRIBUTORS_API_SERVICE.fetchOrganizationLeaderboard(queryKey, queryFn);

const organizations = computed<OrganizationLeaderboard>(
  () => data.value?.pages[0] as OrganizationLeaderboard
);

const isEmpty = computed(() => isEmptyData(organizations.value?.data as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense()
})

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.ORGANIZATIONS_LEADERBOARD);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationsLeaderboard'
};
</script>
