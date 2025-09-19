<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="py-4 sm:py-5 border-t first:border-0 border-neutral-100 flex flex-col sm:flex-row gap-4 sm:gap-6"
  >
    <div class="w-full sm:w-27 sm:min-w-27">
      <lfx-project-security-evaluation-result-tag
        size="small"
        :result="props.assessment.result"
        class="whitespace-nowrap"
      />
    </div>
    <div class="flex flex-col sm:flex-row flex-grow gap-4 sm:gap-10 items-start">
      <div class="w-full sm:w-1/2">
        <p class="text-xs font-semibold mb-2">
          Requirement ID: {{props.assessment.requirementId}}
        </p>
        <p class="text-body-2 text-neutral-600">
          {{props.assessment.description}}
        </p>
      </div>
      <div
        v-if="props.assessment.recommendation && props.assessment.result !== 'Passed'"
        class="w-full sm:w-1/2"
      >
        <div class="flex items-center gap-1 mb-2">
          <lfx-icon
            name="lightbulb"
            :size="14"
          />
          <p class="text-xs font-semibold">
            Recommendation
          </p>
        </div>
        <p class="text-body-2 text-neutral-600">
          {{props.assessment.recommendation}}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type {SecurityAssessmentData} from "~~/types/security/responses.types";
import LfxProjectSecurityEvaluationResultTag
  from "~/components/modules/project/components/security/evaluation-result-tag.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";

const props = defineProps<{
  assessment: SecurityAssessmentData
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationAssesment',
}
</script>
