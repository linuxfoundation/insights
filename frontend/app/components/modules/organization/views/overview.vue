<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <div class="org-overview">
      <lfx-org-kpi-row />
      <div class="org-charts-row">
        <lfx-org-activity-chart />
        <lfx-org-contributors-chart />
      </div>
      <lfx-org-projects-section />
      <lfx-org-locked-contributors-section />
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxOrgKpiRow from '~/components/modules/organization/components/overview/kpi-row.vue';
import LfxOrgProjectsSection from '~/components/modules/organization/components/overview/projects-section.vue';
import LfxOrgActivityChart from '~/components/modules/organization/components/overview/activity-chart.vue';
import LfxOrgContributorsChart from '~/components/modules/organization/components/overview/contributors-chart.vue';
import LfxOrgLockedContributorsSection from '~/components/modules/organization/components/overview/locked-contributors-section.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxOrganizationOverview',
};
</script>

<style lang="scss" scoped>
.org-overview {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-top: 1.25rem;
  padding-bottom: 0;

  @media (min-width: 768px) {
    gap: 2rem;
    padding-top: 2.5rem;
  }
}

.org-charts-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  > * {
    min-width: 0;
  }

  @media (min-width: 768px) {
    gap: 2rem;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
