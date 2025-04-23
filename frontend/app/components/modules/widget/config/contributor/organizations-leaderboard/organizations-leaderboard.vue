<template>
  <section
    class="mt-5"
  >
    <div
      class="mb-6"
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
        :organizations="organizations.data"
        :show-percentage="true"
      />

      <div
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
      :selected-metric="metric"
    />
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 ref, computed, onServerPrefetch
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

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all:all');
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);
const isDrawerOpened = ref(false);

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
  suspense,
} = CONTRIBUTORS_API_SERVICE.fetchOrganizationLeaderboard(queryKey, queryFn);

const organizations = computed<OrganizationLeaderboard>(
  () => data.value?.pages[0] as OrganizationLeaderboard
);

const isEmpty = computed(() => isEmptyData(organizations.value?.data as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense()
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationsLeaderboard'
};
</script>
