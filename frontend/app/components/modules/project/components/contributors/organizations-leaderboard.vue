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
        <div v-else class="lfx-table">
          <div class="lfx-table-header">
            <div>Contributor</div>
            <div>{{ contributionColumnHeader }}</div>
          </div>

          <div
            v-for="(organization, index) in organizations.data"
            :key="index"
            class="lfx-table-row">
            <div class="flex flex-row gap-3 items-center">
              <lfx-avatar :src="organization.logo" type="organization" />
              <div>{{ organization.name }}</div>
            </div>
            <div>{{ formatNumber(organization.contributions) }}</div>
          </div>
        </div>
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, watch, computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import type { OrganizationLeaderboard } from '~/components/shared/types/contributors.types';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxMetricDropdown from '~/components/modules/project/components/contributors/metric-dropdown.vue';
import { metricsOptions } from '~/components/shared/types/metrics';

const props = withDefaults(
  defineProps<{
    timePeriod?: string;
  }>(),
  {
    timePeriod: '90d'
  }
);
const { showToast } = useToastService();

const route = useRoute();
const metric = ref('all');
const { data, status, error } = useFetch(
  () => `/api/contributors/organization-leaderboard?metric=${metric.value}&project=${
      route.params.slug
    }&repository=${route.params.name || ''}&time-period=${props.timePeriod}`
);

const organizations = computed<OrganizationLeaderboard>(
  () => data.value as OrganizationLeaderboard
);
const contributionColumnHeader = computed(() => {
  if (metric.value === 'all') {
    return 'Total Contributions';
  }
  return `Total ${metricsOptions.find((option) => option.value === metric.value)?.label}`;
});

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
