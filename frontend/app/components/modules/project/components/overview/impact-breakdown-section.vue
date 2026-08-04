<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div v-if="!isEmpty">
    <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
      <h2 class="text-heading-3 font-secondary font-bold">Impact breakdown</h2>
      <div
        v-if="props.impactScore !== null"
        class="flex items-center gap-1.5"
      >
        <span class="text-sm font-semibold text-neutral-900"
          >{{ impactLabelDisplay }} ({{ props.impactScore }}/100)</span
        >
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxImpactBreakdownMetricRow from './impact-breakdown/metric-row.vue';
import { getImpactLabelDisplay } from '~~/config/trust-score';
import type { ImpactBreakdownResults } from '~~/types/overview/responses.types';

const props = defineProps<{
  impactScore: number | null;
  impactLabel: string | null;
  data: ImpactBreakdownResults | null;
}>();

const isEmpty = computed(() => props.impactScore === null);

const impactLabelDisplay = computed(() => getImpactLabelDisplay(props.impactLabel));
</script>

<script lang="ts">
export default {
  name: 'LfxImpactBreakdownSection',
};
</script>
