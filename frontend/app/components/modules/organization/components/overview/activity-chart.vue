<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="org-chart-wrapper">
      <div class="flex gap-3 items-center mb-4">
        <div
          class="size-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <lfx-icon
            name="code-commit"
            :size="20"
          />
        </div>
        <div>
          <h2 class="text-heading-5 font-bold font-secondary">Contributions</h2>
          <p class="org-chart-description">by {{ orgDisplayName }} contributors (last 10 years)</p>
        </div>
      </div>
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
        No contribution data available.
      </div>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import type { OrgActivityTimeseries } from '~~/types/organization-page';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';
import { lfxColors } from '~/config/styles/colors';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const route = useRoute();
const orgSlug = route.params.orgSlug as string;
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'this organization');
const currentYear = new Date().getFullYear().toString();

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE_ACTIVITY, orgSlug]);

const { data, isLoading } = useQuery<OrgActivityTimeseries[]>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchActivityTimeseries(orgSlug),
});

const chartData = computed<ChartData[]>(() => {
  if (!data.value) return [];
  return data.value.map((item) => ({
    key: item.startDate,
    values: [item.activityCount],
    isIncomplete: item.startDate.startsWith(currentYear),
  }));
});

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Contributions',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    color: lfxColors.brand[500],
  },
]);

const chartConfig = computed(() => {
  if (!chartData.value.length) return null;
  return getBarChartConfig(chartData.value, chartSeries.value, 'yearly', true);
});
</script>

<script lang="ts">
export default {
  name: 'LfxOrgActivityChart',
};
</script>

<style lang="scss" scoped>
.org-chart-wrapper {
  padding: 1.25rem;
}

.org-chart-description {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
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
