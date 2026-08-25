<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
      <h2 class="text-xl leading-8 font-primary font-semibold text-neutral-900">Impact breakdown</h2>
      <lfx-chip
        v-if="props.impactScore !== null"
        type="bordered"
        size="xsmall"
        class="flex items-center gap-1.5"
      >
        <span class="font-semibold text-neutral-900">{{ impactLabelDisplay }}</span>
        <span class="text-neutral-500">({{ props.impactScore }}/100)</span>
      </lfx-chip>
    </div>

    <lfx-empty-state
      v-if="isEmpty"
      icon="chart-network"
      title="Impact not available"
      description="This project publishes no tracked packages. Impact cannot be computed without a package registry presence."
    />
    <template v-else>
      <p
        v-if="impactDescription"
        class="text-xs text-neutral-500 mb-2"
      >
        {{ impactDescription }}
      </p>

      <div v-if="data">
        <lfx-impact-breakdown-metric-row
          name="Transitive dependents"
          :description="getTransitiveDependentsDescription(data.transitiveDependents)"
          :value="data.transitiveDependents"
          :band="data.transitiveDependentsBand"
        />
        <lfx-impact-breakdown-metric-row
          v-if="data.sonatypePopularityScore !== null"
          name="Popularity (Maven Central)"
          :description="getPopularityDescription(data.sonatypePopularityScore)"
          :value="data.sonatypePopularityScore"
          :band="data.sonatypePopularityScoreBand"
          :value-formatter="popularityFormatter"
        />
        <lfx-impact-breakdown-metric-row
          v-if="!(data.sonatypePopularityScore !== null && data.downloads === null)"
          name="Downloads (last 30 days)"
          :description="getDownloadsDescription(data.downloads)"
          :value="data.downloads"
          :band="data.downloadsBand"
          :value-formatter="downloadsFormatter"
        />
        <lfx-impact-breakdown-metric-row
          name="Direct dependents"
          :description="getDirectDependentsDescription(data.directDependents)"
          :value="data.directDependents"
          :band="data.directDependentsBand"
        />
        <p class="text-xs text-neutral-500 mt-2">
          Impact score aggregates all signals available for this ecosystem with equal weight.
        </p>
      </div>

      <div
        v-else-if="status === 'error'"
        class="text-xs text-neutral-500 mt-4"
      >
        Something went wrong while loading the Impact breakdown for this project. Please try again later.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxImpactBreakdownMetricRow from './impact-breakdown/metric-row.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxEmptyState from '~/components/shared/components/empty-state.vue';
import { getImpactLabelDisplay } from '~~/config/trust-score';
import {
  getTransitiveDependentsDescription,
  getPopularityDescription,
  getDownloadsDescription,
  getDirectDependentsDescription,
  getImpactSummaryDescription,
} from '~~/config/health-breakdown-templates';
import { formatNumberApprox } from '~/components/shared/utils/formatter';
import type { ImpactBreakdownResults } from '~~/types/overview/responses.types';

const props = defineProps<{
  impactScore: number | null;
  impactLabel: string | null;
  data: ImpactBreakdownResults | null;
  status: AsyncDataRequestStatus;
}>();

const isEmpty = computed(() => props.impactScore === null);

const impactLabelDisplay = computed(() => getImpactLabelDisplay(props.impactLabel));

const impactDescription = computed(() =>
  getImpactSummaryDescription(props.impactLabel, props.data?.transitiveDependents),
);

const popularityFormatter = (value: number) => `${Math.round(value)} / 100`;
const downloadsFormatter = (value: number) => `${formatNumberApprox(value)} / month`;
</script>

<script lang="ts">
export default {
  name: 'LfxImpactBreakdownSection',
};
</script>
