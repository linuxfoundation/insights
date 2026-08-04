<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div v-if="!isEmpty">
    <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
      <h2 class="text-xl leading-8 font-primary font-semibold text-neutral-900">Impact breakdown</h2>
      <lfx-chip
        v-if="props.impactScore !== null"
        type="bordered"
        size="xsmall"
        class="flex items-center gap-1.5"
      >
        <span class="text-sm font-semibold text-neutral-900"
          >{{ impactLabelDisplay }} ({{ props.impactScore }}/100)</span
        >
      </lfx-chip>
    </div>
    <p class="text-xs text-neutral-500 mb-2">
      How central this project is to the open source dependency graph, measured against every other tracked project.
    </p>

    <div v-if="data">
      <lfx-impact-breakdown-metric-row
        name="Transitive dependents"
        signal-type="Primary"
        description="The number of projects that depend on this project, directly or through another dependency."
        :value="data.transitiveDependents"
        :band="data.transitiveDependentsBand"
      />
      <lfx-impact-breakdown-metric-row
        name="Graph centrality"
        signal-type="Primary"
        description="How central this project is within the overall open source dependency graph."
        :value="data.centrality"
        :band="data.centralityBand"
      />
      <lfx-impact-breakdown-metric-row
        name="Downloads"
        signal-type="Secondary"
        description="Package downloads across all registries linked to this project, in the last 30 days."
        :value="data.downloads"
        :band="data.downloadsBand"
      />
      <lfx-impact-breakdown-metric-row
        name="Direct dependents"
        signal-type="Secondary"
        description="The number of projects that depend directly on this project's packages."
        :value="data.directDependents"
        :band="data.directDependentsBand"
      />
    </div>

    <div
      v-else-if="status === 'error'"
      class="text-xs text-neutral-500 mt-4"
    >
      Something went wrong while loading the Impact breakdown for this project. Please try again later.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxImpactBreakdownMetricRow from './impact-breakdown/metric-row.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import { getImpactLabelDisplay } from '~~/config/trust-score';
import type { ImpactBreakdownResults } from '~~/types/overview/responses.types';

const props = defineProps<{
  impactScore: number | null;
  impactLabel: string | null;
  data: ImpactBreakdownResults | null;
  status: AsyncDataRequestStatus;
}>();

const isEmpty = computed(() => props.impactScore === null);

const impactLabelDisplay = computed(() => getImpactLabelDisplay(props.impactLabel));
</script>

<script lang="ts">
export default {
  name: 'LfxImpactBreakdownSection',
};
</script>
