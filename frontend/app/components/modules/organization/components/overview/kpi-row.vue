<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="c-card org-kpi-row">
    <div
      v-for="kpi in kpis"
      :key="kpi.label"
      class="org-kpi-item"
    >
      <template v-if="!isLoading">
        <div class="org-kpi-value-row">
          <p class="text-heading-3 font-bold font-secondary org-kpi-value">
            {{ formatNumber(kpi.value) }}
          </p>
          <span
            v-if="kpi.trend !== undefined"
            class="org-kpi-trend"
            :class="kpi.trend >= 0 ? 'org-kpi-trend-up' : 'org-kpi-trend-down'"
          >
            <lfx-icon
              :name="kpi.trend >= 0 ? 'arrow-up' : 'arrow-down'"
              :size="10"
            />
            {{ Math.abs(kpi.trend) }}%
          </span>
        </div>
        <p class="org-kpi-label">
          {{ kpi.label }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import type { OrganizationKpis } from '~~/types/organization-page';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const route = useRoute();
const orgName = route.params.orgName as string;
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'This Organization');

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE_KPIS, orgName]);

const { data, isLoading } = useQuery<OrganizationKpis>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchKpis(orgName),
});

const kpis = computed(() => [
  {
    value: data.value?.activeContributors ?? 0,
    trend: data.value?.activeContributorsTrend,
    label: `Active ${orgDisplayName.value} Contributors (last 365d)`,
  },
  {
    value: data.value?.maintainerRoles ?? 0,
    trend: undefined,
    label: `Maintainer Roles Held by ${orgDisplayName.value} Contributors`,
  },
  {
    value: data.value?.criticalProjects ?? 0,
    trend: undefined,
    label: `Critical Projects ${orgDisplayName.value} Contributors Contributed To`,
  },
]);
</script>

<script lang="ts">
export default {
  name: 'LfxOrgKpiRow',
};
</script>

<style lang="scss" scoped>
.org-kpi-row {
  display: flex;
  flex-direction: row;
}

.org-kpi-item {
  flex: 1;
  padding: 1.25rem;

  & + & {
    border-left: 1px solid #e2e8f0;
  }
}

.org-kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.org-kpi-value {
  color: #0f172a;
}

.org-kpi-trend {
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}

.org-kpi-trend-up {
  color: #047857;
}

.org-kpi-trend-down {
  color: #dc2626;
}

.org-kpi-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}
</style>
