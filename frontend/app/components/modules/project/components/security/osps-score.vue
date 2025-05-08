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
        <div class="aspect-video h-40 w-full">
          <lfx-chart
            id="chartHalf"
            :config="chartConfig"
          />
        </div>
      </div>
      <p class="text-xs font-medium text-center px-4">
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

const props = defineProps<{
  isRepository: boolean,
  data: SecurityData[]
}>()

const results = computed(() => {
  if(props.data.length === 0) {
    return 0;
  }

  if(props.isRepository) {
    const assessments = (props.data || []).map((check) => check.assessments).flat();
    const passed = assessments.filter((assessment) => assessment.result === SecurityDataResult.PASSED);
    return Math.round((passed.length / assessments.length) * 100);
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

  // Calculate the average passing rate for each category
  const averagePassingRateSums = Object.values(grouppedByCategory).reduce((passingRateSum, checks) => {
    // Group checks by repository
    const grouppedByRepository = (checks || []).reduce((mapping, check) => {
      const obj = {...mapping};
      if (!obj[check.repo]) {
        obj[check.repo] = [];
      }
      obj[check.repo]?.push(check);
      return obj;
    }, {} as Record<string, SecurityData[]>);
    // Calculate the passing rate for each repository
    const passedRepos = Object.values(grouppedByRepository).reduce((sum, repoChecks) => {
      const assessments = repoChecks.map((check) => check.assessments.map((a) => a.result)).flat();
      if(assessments.includes(SecurityDataResult.FAILED) || assessments.includes(SecurityDataResult.NEEDS_REVIEW)) {
        return sum;
      }
      return sum + 1;
    }, 0);
    // Calculate the passing rate for the category
    const passingRate = passedRepos / Object.keys(grouppedByRepository).length;
    return passingRateSum + passingRate;
  }, 0)

  // Calculate the average passing rate for all categories
  const totalCategories = Object.keys(grouppedByCategory).length;
  if (totalCategories === 0) {
    return 0;
  }
  return Math.round((averagePassingRateSums / totalCategories) * 100);
})

const config = computed<OspsBaselineScore>(() => lfxOspsBaselineScore.find(
  (item) => results.value >= item.minScore && results.value <= item.maxScore
) || {
  minScore: 0,
  maxScore: 100,
  label: 'Unknown',
  description: 'Not enough data',
  lineColor: lfxColors.warning[500],
  badgeBgColor: lfxColors.warning[50],
  badgeTextColor: lfxColors.warning[600],
},)

const chartConfig = computed(() => getGaugeChartConfig({
  value: results.value, // 0-100
  name: config.value.label,
  gaugeType: 'half',
  color: config.value.badgeBgColor,
  textColor: config.value.badgeTextColor,
  lineColor: config.value.lineColor,
}));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityOspsScore',
}
</script>
