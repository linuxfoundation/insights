<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article class="py-4 sm:py-5 border-t first:border-0 border-neutral-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
    <div
      class="w-full sm:w-1/4 sm:min-w-1/4 border-l-3 border-solid pl-3"
      :class="[borderColor]"
    >
      <lfx-project-security-evaluation-result-tag
        size="small"
        :result="props.assessment.result"
        class="whitespace-nowrap"
      />
    </div>
    <div class="flex flex-col flex-grow gap-3 items-start sm:w-3/4">
      <div class="w-full">
        <p class="text-xs font-semibold mb-2">Requirement ID: {{ props.assessment.requirementId }}</p>
        <p class="text-body-2 text-neutral-600">
          {{ props.assessment.description }}
        </p>
      </div>
      <div
        v-if="props.assessment.message && props.assessment.result !== SecurityDataResult.PASSED"
        class="w-full border-t border-neutral-200 pt-3"
      >
        <p class="text-xs font-semibold mb-2">Reason</p>
        <p class="text-body-2 text-neutral-600">
          {{ props.assessment.message }}
        </p>
      </div>
      <div
        v-if="props.assessment.recommendation && props.assessment.result !== SecurityDataResult.PASSED"
        class="w-full border-t border-neutral-200 pt-3"
      >
        <p class="text-xs font-semibold mb-2">Recommendation</p>
        <p class="text-body-2 text-neutral-600">
          {{ props.assessment.recommendation }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type SecurityAssessmentData, SecurityDataResult } from '~~/types/security/responses.types';
import LfxProjectSecurityEvaluationResultTag from '~/components/modules/project/components/security/evaluation-result-tag.vue';

const props = defineProps<{
  assessment: SecurityAssessmentData;
}>();

const borderColor = computed(() => {
  switch (props.assessment.result) {
    case SecurityDataResult.PASSED:
      return 'border-positive-500';
    case SecurityDataResult.FAILED:
      return 'border-negative-500';
    case SecurityDataResult.NEEDS_REVIEW:
      return 'border-warning-500';
    default:
      return 'border-neutral-100';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationAssesment',
};
</script>
