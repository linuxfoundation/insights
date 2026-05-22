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
        <div class="flex gap-3">
          <div
            class="size-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          >
            <lfx-icon
              :name="kpi.icon"
              :size="20"
            />
          </div>
          <div class="min-w-0">
            <div class="org-kpi-value-row">
              <p class="text-heading-2 font-bold org-kpi-value">
                {{ formatNumber(kpi.value) }}
              </p>
              <span
                v-if="kpi.trend !== undefined"
                class="org-kpi-trend"
                :class="kpi.trend >= 0 ? 'org-kpi-trend-up' : 'org-kpi-trend-down'"
              >
                <lfx-icon
                  :name="kpi.trend >= 0 ? 'circle-arrow-up' : 'circle-arrow-down'"
                  type="solid"
                  :size="12"
                />
                {{ Math.abs(kpi.trend) }}%
                <span v-if="kpi.trendAbsolute !== undefined">
                  ({{ kpi.trendAbsolute >= 0 ? '+' : '' }}{{ formatNumber(kpi.trendAbsolute) }})
                </span>
              </span>
            </div>
            <p class="org-kpi-label">
              {{ kpi.label }}
            </p>
          </div>
        </div>
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
const orgSlug = route.params.orgSlug as string;
const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'this organization');

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE_KPIS, orgSlug]);

const { data, isLoading } = useQuery<OrganizationKpis>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchKpis(orgSlug),
});

const kpis = computed(() => [
  {
    icon: 'people-group',
    value: data.value?.activeContributors ?? 0,
    trend: data.value?.activeContributorsTrend,
    trendAbsolute: data.value?.activeContributorsTrendAbsolute,
    trendPrevious: data.value?.activeContributorsTrendPrevious,
    label: `Active ${orgDisplayName.value} contributors (last 365d)`,
  },
  {
    icon: 'user-shield',
    value: data.value?.maintainerRoles ?? 0,
    trend: undefined,
    trendAbsolute: undefined,
    trendPrevious: undefined,
    label: `Maintainer roles held by ${orgDisplayName.value} contributors`,
  },
  {
    icon: 'laptop-code',
    value: data.value?.criticalProjects ?? 0,
    trend: undefined,
    trendAbsolute: undefined,
    trendPrevious: undefined,
    label: `Critical projects ${orgDisplayName.value} employees contributed to`,
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
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
}

.org-kpi-item {
  flex: 1;
  padding: 1.25rem;

  & + & {
    border-top: 1px solid #e2e8f0;

    @media (min-width: 768px) {
      border-top: none;
      border-left: 1px solid #e2e8f0;
    }
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
  gap: 0.25rem;
}

.org-kpi-trend-up {
  color: #047857;
}

.org-kpi-trend-down {
  color: #dc2626;
}

.org-kpi-label {
  font-size: 0.75rem;
  color: #475569;
  margin-top: 0.125rem;
}
</style>
