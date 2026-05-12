<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="org-chart-wrapper">
      <h2 class="text-heading-5 font-bold font-secondary org-chart-title">
        Opened PRs by {{ orgDisplayName }} Contributors
      </h2>
      <div
        v-if="isLoading"
        class="org-chart-area"
      >
        <lfx-skeleton height="100%" />
      </div>
      <div
        v-else-if="chartConfig"
        class="org-chart-area"
      >
        <client-only>
          <lfx-chart
            :config="chartConfig"
            :animation="true"
          />
        </client-only>
      </div>
      <div
        v-else
        class="org-chart-area org-chart-empty"
      >
        No contributor data available.
      </div>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import type { OrgContributorTimeseries } from '~~/types/organization-page';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';
import { lfxColors } from '~/config/styles/colors';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const route = useRoute();
const orgName = route.params.orgName as string;
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'this organization');
const currentYear = new Date().getFullYear().toString();

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE_CONTRIBUTORS_TIMESERIES, orgName]);

const { data, isLoading } = useQuery<OrgContributorTimeseries[]>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchContributorTimeseries(orgName),
});

const chartData = computed<ChartData[]>(() => {
  if (!data.value) return [];
  return data.value.map((item) => ({
    key: item.startDate,
    values: [item.contributorCount],
    isIncomplete: item.startDate.startsWith(currentYear),
  }));
});

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'PRs Opened',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    color: lfxColors.positive[500],
  },
]);

const chartConfig = computed(() => {
  if (!chartData.value.length) return null;
  return getBarChartConfig(chartData.value, chartSeries.value, 'yearly', true);
});
</script>

<script lang="ts">
export default {
  name: 'LfxOrgContributorsChart',
};
</script>

<style lang="scss" scoped>
.org-chart-wrapper {
  padding: 1.25rem;
}

.org-chart-title {
  margin-bottom: 1rem;
}

.org-chart-area {
  height: 280px;
}

.org-chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
