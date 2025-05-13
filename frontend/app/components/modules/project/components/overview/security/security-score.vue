<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div class="flex  justify-center items-center pt-6 gap-8">
      <div class="aspect-[3/2] w-full relative max-w-50">
        <lfx-chart
          :config="ospsChartConfig"
        />
      </div>
      <div class="max-w-80">
        <h3 class="text-h3 font-bold font-secondary pb-3">
          OSPS Baseline score
        </h3>
        <p class="text-sm leading-5">
          {{config.description}}
        </p>
      </div>
    </div>
    <div class="bg-neutral-50 my-8 rounded-lg p-3 text-neutral-500 text-xs leading-4.5 text-center">
      The <b class="font-semibold">OSPS Baseline</b>
      is a set of security criteria that projects should meet to demonstrate a strong security posture.
      <a
        :href="links.securityScore"
        target="_blank"
        class="text-brand-500"
      >
        Learn more
      </a>
    </div>
    <div class="flex justify-between items-center pb-4">
      <h3 class="text-heading-3 font-secondary font-bold">
        Controls assessment
      </h3>
      <nuxt-link :to="{name: name ? LfxRoutes.REPOSITORY_SECURITY : LfxRoutes.PROJECT_SECURITY}">
        <lfx-button
          type="tertiary"
          size="small"
        >
          <lfx-icon name="arrow-up-right" />
          Assessment breakdown
        </lfx-button>
      </nuxt-link>
    </div>
    <article
      v-for="(checks, title) in groupedData"
      :key="title"
      class="flex items-center gap-8 py-4 border-t border-neutral-100"
    >
      <div class="flex-grow">
        <h4 class="text-sm leading-5 font-semibold">
          {{ title}}
        </h4>
        <p
          v-if="categoryConfig(title)"
          class="text-body-2 text-neutral-500 mt-1"
        >
          {{ categoryConfig(title)?.description }}
        </p>
      </div>
      <lfx-project-security-evaluation-result :results="assessmentsResults(checks)">
        <template #default="{result}">
          <div class="h-12 w-12 min-w-12">
            <lfx-chart :config="categoryChartConfig(result)" />
          </div>
        </template>
      </lfx-project-security-evaluation-result>
    </article>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {storeToRefs} from "pinia";
import {useRoute} from "nuxt/app";
import type {SecurityAssessmentData, SecurityData} from "~~/types/security/responses.types";
import {PROJECT_SECURITY_SERVICE} from "~/components/modules/project/services/security.service";
import type {OspsBaselineScore} from "~/components/modules/project/config/osps-baseline-score";
import {lfxColors} from "~/config/styles/colors";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxChart from "~/components/uikit/chart/chart.vue";
import {getGaugeChartConfig} from "~/components/uikit/chart/configs/gauge.chart";
import {links} from "~/config/links";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxButton from "~/components/uikit/button/button.vue";
import {lfxSecurityCategories} from "~/components/modules/project/config/security-category";
import LfxProjectSecurityEvaluationResult from "~/components/modules/project/components/security/evaluation-result.vue";

const { selectedRepository } = storeToRefs(useProjectStore());
const route = useRoute();
const {name} = route.params

const props = defineProps<{
  data: SecurityData[];
}>();

const results = computed(
    () => PROJECT_SECURITY_SERVICE.calculateOSPSScore((props.data || []), !!selectedRepository.value)
);

const config = computed<OspsBaselineScore>(() => {
  if((props.data || []).length === 0){
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
  return PROJECT_SECURITY_SERVICE.getOSPSconfig(results.value);
})

const ospsChartConfig = computed(() => getGaugeChartConfig({
  value: results.value, // 0-100
  name: config.value.label,
  gaugeType: 'half',
  color: config.value.badgeBgColor,
  textColor: config.value.badgeTextColor,
  lineColor: config.value.lineColor,
  loading: config.value.loading,
  noData: props.data.length === 0,
}));

const groupedData = computed(() => (props.data || []).reduce((mapping, check) => {
  const obj = {...mapping};
  if (!obj[check.category]) {
    obj[check.category] = [];
  }
  obj[check.category]?.push(check);
  return obj;
}, {} as Record<string, SecurityData[]>))

const categoryConfig = (category: string) => category && lfxSecurityCategories[category]

const categoryChartConfig = (result: number) => getGaugeChartConfig({
  value: result,
  gaugeType: 'full',
  name: '',
  lineColor: lfxColors.brand[500],
})

const assessmentsResults = (checks: SecurityData[]) => {
  const assessments = checks.map((check) => check.assessments).flat();
  return assessments.map((assessment: SecurityAssessmentData) => assessment.result);
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityScore',
}
</script>
