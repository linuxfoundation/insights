<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="w-full !shadow-sm">
    <div class="p-6 pb-8">
      <h2 class="text-heading-3 font-bold font-secondary">OSPS Baseline score</h2>
      <div class="pt-8 px-4 flex justify-center">
        <div class="aspect-[3/2] w-full relative">
          <lfx-chart
            id="chartHalf"
            :config="chartConfig"
          />
          <lfx-skeleton
            v-if="props.isLoading"
            width="40%"
            height="30%"
            class="!absolute left-1/2 transform -translate-x-1/2 top-1/4 rounded-lg"
          />
          <lfx-skeleton
            v-if="props.isLoading"
            width="25%"
            height="12%"
            class="!absolute left-1/2 transform -translate-x-1/2 top-2/3 rounded-lg"
          />
        </div>
      </div>
      <p
        v-if="config.description"
        class="text-xs font-medium text-center px-4"
      >
        {{ config.description }}
      </p>
    </div>
    <div class="bg-neutral-50 border-t border-neutral-100 py-4 px-6">
      <p class="text-neutral-500 text-xs">
        The <b class="font-semibold">Open Source Project Security (OSPS) Baseline</b>
        is a set of security criteria that projects should meet to demonstrate a strong security
        posture.
      </p>
      <a
        :href="links.ospsScore"
        target="_blank"
        rel="noopener noreferrer"
        class="pt-3 block"
      >
        <div class="flex items-center gap-1">
          <p class="text-brand-500 text-xs font-semibold">Learn more</p>
          <lfx-icon
            name="arrow-up-right"
            :size="12"
            class="text-brand-500 font-medium"
          />
        </div>
      </a>
    </div>
  </lfx-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { lfxColors } from '~/config/styles/colors';
import type { SecurityData } from '~~/types/security/responses.types';
import { links } from '~/config/links';
import type { OspsBaselineScore } from '~/components/modules/project/config/osps-baseline-score';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import { PROJECT_SECURITY_SERVICE } from '~/components/modules/project/services/security.service';

const props = defineProps<{
  isRepository: boolean;
  data: SecurityData[];
  isLoading: boolean;
}>();

const results = computed(() =>
  PROJECT_SECURITY_SERVICE.calculateOSPSScore(props.data, props.isRepository),
);

const config = computed<OspsBaselineScore>(() => {
  if (props.isLoading) {
    return {
      minScore: 0,
      maxScore: 100,
      loading: true,
      label: '',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.white,
      badgeTextColor: lfxColors.white,
    };
  }
  if (props.data.length === 0) {
    return {
      minScore: 0,
      maxScore: 100,
      label: 'No data available',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.neutral[100],
      badgeTextColor: lfxColors.neutral[500],
    };
  }
  return PROJECT_SECURITY_SERVICE.getOSPSconfig(results.value);
});

const chartConfig = computed(() =>
  getGaugeChartConfig({
    value: results.value, // 0-100
    name: config.value.label,
    gaugeType: 'half',
    color: config.value.badgeBgColor,
    textColor: config.value.badgeTextColor,
    lineColor: config.value.lineColor,
    loading: config.value.loading,
    noData: props.data.length === 0,
  }),
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityOspsScore',
};
</script>
