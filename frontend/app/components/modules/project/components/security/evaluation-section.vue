<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-accordion-item
    name="access-control"
    class="py-5 border-t border-neutral-100"
    :reverse="true"
  >
    <div class="flex justify-between gap-4 w-full">
      <div v-if="props.checks.length">
        <h4 class="text-heading-4 font-bold font-secondary">
          {{ category}}
        </h4>
        <p
          v-if="config"
          class="text-body-2 text-neutral-500 mt-1"
        >
          {{ config.description }}
        </p>
      </div>
      <lfx-project-security-evaluation-result :results="assessmentsResults">
        <template #default="{result}">
          <div class="h-12 w-12">
            <lfx-chart :config="chartConfig(result)" />
          </div>
        </template>
      </lfx-project-security-evaluation-result>
    </div>

    <template #content>
      <div class="border border-neutral-200 rounded-md px-4 mt-4">
        <slot />
      </div>
    </template>
  </lfx-accordion-item>
</template>
<script setup lang="ts">
import {computed} from "vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
import LfxProjectSecurityEvaluationResult from "~/components/modules/project/components/security/evaluation-result.vue";
import type { SecurityDataResult,SecurityAssessmentData, SecurityData} from "~~/types/security/responses.types";
import LfxChart from "~/components/uikit/chart/chart.vue";
import {getGaugeChartConfig} from "~/components/uikit/chart/configs/gauge.chart";
import {lfxColors} from "~/config/styles/colors";
import {lfxSecurityCategories} from "~/components/modules/project/config/security-category";

const props = defineProps<{
  checks: SecurityData[]
}>()

const assessments = computed<SecurityAssessmentData[]>(() => props.checks.map((check) => check.assessments).flat());
const assessmentsResults = computed<SecurityDataResult[]>(() => assessments.value
    .map((assessment: SecurityAssessmentData) => assessment.result));

const chartConfig = (result: number) => getGaugeChartConfig({
    value: result,
    gaugeType: 'full',
    name: '',
    lineColor: lfxColors.brand[500],
  })

const category = computed(() => props.checks[0]?.category);
const config = computed(() => category.value && lfxSecurityCategories[category.value]);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationSection',
}
</script>
