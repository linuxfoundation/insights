<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Organizations leaderboard</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Organization ranking based on the number of activities performed by contributors on their behalf and the impact on
      the project.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
      <lfx-metric-dropdown v-model="metric" />

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching organizations leaderboard"
        :is-empty="isEmpty"
        :height="status === 'pending' ? 400 : 100"
        use-min-height
      >
        <lfx-organizations-table
          :metric="metric"
          :organizations="organizations.data"
          :show-percentage="true"
        />
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxMetricDropdown from './fragments/metric-dropdown.vue';
import LfxOrganizationsTable from './fragments/organizations-table.vue';
import type { OrganizationLeaderboard } from '~~/types/contributors/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { links } from '~/config/links';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all');
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/organization-leaderboard`,
  {
    params: {
      metric,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const organizations = computed<OrganizationLeaderboard>(
  () => data.value as OrganizationLeaderboard
);

const isEmpty = computed(() => isEmptyData(organizations.value?.data as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationsLeaderboard'
};
</script>
