<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex h-4 gap-0.5 overflow-hidden rounded-full bg-neutral-100"
      role="img"
      :aria-label="ariaLabel"
    >
      <span
        v-for="segment in segments"
        :key="segment.key"
        :class="segment.barClass"
        :style="{ width: `${segment.share}%` }"
      />
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        v-for="segment in segments"
        :key="segment.key"
        class="flex flex-col gap-1"
      >
        <div class="flex items-center gap-2 text-body-2 text-neutral-700">
          <span
            class="size-2.5 shrink-0 rounded-sm"
            :class="segment.barClass"
          />
          {{ segment.label }}
        </div>
        <span class="text-heading-4 font-bold text-neutral-900">{{ formatNumber(segment.value) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatNumber } from '~/components/shared/utils/formatter';
import type { CncfCountrySummary } from '~~/types/report/cncf-country.types';

const props = defineProps<{
  summary: CncfCountrySummary;
  countryName: string;
  countryAdjective: string;
}>();

const segments = computed(() => {
  const total = props.summary.contributorCount || 1;
  return [
    {
      key: 'in-country-elsewhere',
      label: `In ${props.countryName}, other or no organization`,
      value: props.summary.inCountryElsewhereCount,
      barClass: 'bg-brand-300',
    },
    {
      key: 'in-country-at-country-organization',
      label: `In ${props.countryName}, at an organization with ${props.countryAdjective} HQ`,
      value: props.summary.inCountryAtCountryOrganizationCount,
      barClass: 'bg-brand-500',
    },
    {
      key: 'abroad-at-country-organization',
      label: `Abroad, at an organization with ${props.countryAdjective} HQ`,
      value: props.summary.abroadAtCountryOrganizationCount,
      barClass: 'bg-brand-800',
    },
  ].map((segment) => ({ ...segment, share: (segment.value / total) * 100 }));
});

const ariaLabel = computed(() =>
  segments.value.map((segment) => `${segment.label}: ${formatNumber(segment.value)}`).join(', '),
);
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountrySplit',
};
</script>
