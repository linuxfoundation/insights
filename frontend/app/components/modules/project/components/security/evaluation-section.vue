<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-4 w-full">
    <lfx-project-security-evaluation-result :results="assessmentsResults">
      <template #default="{ result }">
        <lfx-tooltip
          :content="props.tooltip"
          :disabled="!props.tooltip"
        >
          <div class="h-12 w-12 min-w-12">
            <lfx-chart :config="chartConfig(result)" />
          </div>
        </lfx-tooltip>
      </template>
    </lfx-project-security-evaluation-result>
    <div v-if="props.checks.length">
      <h2 class="text-heading-4 font-bold font-secondary">
        {{ category }}
      </h2>
      <p
        v-if="config"
        class="text-body-2 text-neutral-500 mt-1"
      >
        {{ config.description }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import LfxProjectSecurityEvaluationResult from '~/components/modules/project/components/security/evaluation-result.vue';
import type { SecurityDataResult, SecurityAssessmentData, SecurityData } from '~~/types/security/responses.types';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';
import { lfxSecurityCategories } from '~/components/modules/project/config/security-category';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

const props = defineProps<{
  checks: SecurityData[];
  tooltip?: string;
}>();

const assessments = computed<SecurityAssessmentData[]>(() => props.checks.map((check) => check.assessments).flat());
const assessmentsResults = computed<SecurityDataResult[]>(() =>
  assessments.value.map((assessment: SecurityAssessmentData) => assessment.result),
);

const chartConfig = (result: number) =>
  getGaugeChartConfig({
    value: result,
    gaugeType: 'full',
    name: '',
    lineColor: lfxColors.brand[500],
  });

const category = computed(() => props.checks[0]?.category);
const config = computed(() => category.value && lfxSecurityCategories[category.value]);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationSection',
};
</script>
