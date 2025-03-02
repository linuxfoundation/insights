<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Organizations leaderboard</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      It ranks contributors based on the number of code commits, pull requests, issues closed, and
      other metrics representing their relative activity levels and impact on the project.
    </p>
    <hr>
    <section class="mt-5">
      <lfx-metric-dropdown v-model="metric" />

      <div class="min-h-[500px]">
        <div v-if="status === 'pending'" class="flex justify-center items-center h-full">
          <lfx-spinner />
        </div>
        <div v-else-if="status === 'error'" class="flex justify-center items-center h-full">
          <!-- <lfx-error-message /> -->
          <!-- TODO: Need to define an empty or error state here -->
        </div>
        <lfx-organizations-table
          v-else
          :metric="metric"
          :organizations="organizations.data"
          :show-percentage="true" />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, watch, computed } from 'vue';
import {storeToRefs} from "pinia";
import LfxMetricDropdown from './fragments/metric-dropdown.vue';
import LfxOrganizationsTable from './fragments/organizations-table.vue';
import type { OrganizationLeaderboard } from './types/contributors.types';
import LfxCard from '~/components/uikit/card/card.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import {useProjectStore} from "~/components/modules/project/store/project.store";

const { showToast } = useToastService();
const {dateStart, dateEnd} = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all');
const {data, status, error} = useFetch(
    `/api/project/${route.params.slug}/contributors/organization-leaderboard`,
    {
      params: {
        metric: metric.value,
        repository: route.params.name || '',
        dateStart,
        dateEnd,
      }
    }
);

const organizations = computed<OrganizationLeaderboard>(
  () => data.value as OrganizationLeaderboard
);

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching contributor leaderboard: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationsLeaderboard'
};
</script>
