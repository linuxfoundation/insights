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
      error-message="Error fetching contributor leaderboard"
      :is-empty="isEmpty"
    >
      <lfx-contributors-table
        :metric="metric"
        :contributors="contributors.data"
      />

      <div
        class="mt-5 flex flex-row justify-center"
      >
        <lfx-button
          type="transparent"
          @click="isDrawerOpened = true"
        >
          All contributors
        </lfx-button>
      </div>
    </lfx-project-load-state>
  </section>
  <lfx-contributor-leaderboard-drawer
    v-model="isDrawerOpened"
    :selected-metric="metric"
  />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 ref, computed, onServerPrefetch
} from 'vue';
import { storeToRefs } from "pinia";
import LfxContributorLeaderboardDrawer from './fragments/contributor-leaderboard-drawer.vue';
import type { ContributorLeaderboard } from '~~/types/contributors/responses.types';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxButton from "~/components/uikit/button/button.vue";
import LfxActivitiesDropdown
  from "~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxContributorsTable from "~/components/modules/widget/components/contributors/fragments/contributors-table.vue";
import {TanstackKey} from "~/components/shared/types/tanstack";
import { CONTRIBUTORS_API_SERVICE } from '~~/app/components/modules/widget/services/contributors.api.service'

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all:all');
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);
const isDrawerOpened = ref(false);

const queryKey = computed(() => [
  TanstackKey.CONTRIBUTORS_LEADERBOARD,
  route.params.slug,
  platform,
  activityType,
  selectedRepository,
  startDate,
  endDate,
  metric
]);

const queryFn = computed(() => CONTRIBUTORS_API_SERVICE.contributorLeaderboardQueryFn(() => ({
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
} = CONTRIBUTORS_API_SERVICE.fetchContributorLeaderboard(queryKey, queryFn);

const contributors = computed<ContributorLeaderboard>(() => data.value?.pages[0] as ContributorLeaderboard);

const isEmpty = computed(() => isEmptyData(contributors.value?.data as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense()
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorsLeaderboard'
};
</script>
