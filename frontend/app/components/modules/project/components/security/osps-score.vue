<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class=" w-full !shadow-sm">
    <div class="p-6 pb-8">
      <h3 class="text-heading-3 font-bold font-secondary">
        OSPS Baseline score
      </h3>
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
        {{config.description}}
      </p>
    </div>
    <div class="bg-neutral-50 border-t border-neutral-100 py-4 px-6">
      <p class="text-neutral-500 text-xs">
        The <b class="font-semibold">Open Source Project Security (OSPS) Baseline</b>
        is a set of security criteria that projects should meet to demonstrate a strong security posture.
      </p>
      <a
        :href="links.learnMore"
        target="_blank"
        class="pt-3 block"
      >
        <div class="flex items-center gap-1">
          <a class="text-brand-500 text-xs font-semibold">
            Learn more
          </a>
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
import {computed} from "vue";
import LfxCard from "~/components/uikit/card/card.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {getGaugeChartConfig} from "~/components/uikit/chart/configs/gauge.chart";
import LfxChart from "~/components/uikit/chart/chart.vue";
import {lfxColors} from "~/config/styles/colors";
import {type SecurityData, SecurityDataResult} from "~~/types/security/responses.types";
import {links} from "~/config/links";
import {lfxOspsBaselineScore, type OspsBaselineScore} from "~/components/modules/project/config/osps-baseline-score";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";

const props = defineProps<{
  isRepository: boolean,
  data: SecurityData[],
  isLoading: boolean,
}>()

const results = computed(() => {
  if(props.data.length === 0) {
    return 0;
  }

  if(props.isRepository) {
    const assessments = (props.data || []).map((check) => check.assessments).flat();
    const passed = assessments.filter((assessment) => assessment.result === SecurityDataResult.PASSED);
    const failed = assessments.filter((assessment) => assessment.result === SecurityDataResult.FAILED);
    const total = passed.length + failed.length;
    return Math.round((passed.length / total) * 100);
  }

  // Group checks by category
  const grouppedByCategory = (props.data || []).reduce((mapping, check) => {
    const obj = {...mapping};
    if (!obj[check.category]) {
      obj[check.category] = [];
    }
    obj[check.category]?.push(check);
    return obj;
  }, {} as Record<string, SecurityData[]>);

  const percentageByCategory: Record<string, number> = {}

  Object.keys(grouppedByCategory).forEach((category) => {
    const assessments = (grouppedByCategory[category] || []).map((check) => check.assessments).flat();
    const passed = assessments.filter((assessment) => assessment.result === SecurityDataResult.PASSED);
    const failed = assessments.filter((assessment) => assessment.result === SecurityDataResult.FAILED);
    const total = passed.length + failed.length;
    percentageByCategory[category] = passed.length / total;
  });

  const passingRateSum = Object.values(percentageByCategory).reduce((sum, value) => sum + value, 0);

  return Math.round((passingRateSum / Object.keys(percentageByCategory).length) * 100);
})

const config = computed<OspsBaselineScore>(() => {
  if(props.isLoading){
    return {
      minScore: 0,
      maxScore: 100,
      loading: true,
      label: '',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.white,
      badgeTextColor: lfxColors.white,
    }
  }
  if(props.data.length === 0){
    return {
      minScore: 0,
      maxScore: 100,
      label: 'No data available',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.neutral[100],
      badgeTextColor: lfxColors.neutral[500],
    }
  }
  return (
    lfxOspsBaselineScore.find(
      (item) => results.value >= item.minScore && results.value <= item.maxScore
    ) || {
      minScore: 0,
      maxScore: 100,
      label: 'No matching score',
      description: '',
      lineColor: lfxColors.neutral[200],
      badgeBgColor: lfxColors.neutral[100],
      badgeTextColor: lfxColors.neutral[500],
    }
  );
})

const chartConfig = computed(() => getGaugeChartConfig({
  value: results.value, // 0-100
  name: config.value.label,
  gaugeType: 'half',
  color: config.value.badgeBgColor,
  textColor: config.value.badgeTextColor,
  lineColor: config.value.lineColor,
  loading: config.value.loading,
  noData: props.data.length === 0,
}));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityOspsScore',
}
</script>
