<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Contributors leaderboard</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      It ranks contributors based on the number of code commits, pull requests, issues closed, and
      other metrics representing their relative activity levels and impact on the project.
    </p>

    <hr>
    <section class="mt-5">
      <lfx-metric-dropdown v-model="metric" />

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching contributor leaderboard"
        :is-empty="isEmpty"
        :height="400"
        use-min-height
      >
        <lfx-contributors-table
          :metric="metric"
          :contributors="contributors.data"
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
import LfxContributorsTable from './fragments/contributors-table.vue';
import type { ContributorLeaderboard } from './types/contributors.types';
import LfxCard from '~/components/uikit/card/card.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all');
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/contributor-leaderboard`,
  {
    params: {
      metric,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const contributors = computed<ContributorLeaderboard>(() => data.value as ContributorLeaderboard);

const isEmpty = computed(() => isEmptyData(contributors.value?.data as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorsLeaderboard'
};
</script>
