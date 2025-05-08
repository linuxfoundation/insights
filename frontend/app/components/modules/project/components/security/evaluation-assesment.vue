<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="py-4 border-t first:border-0 border-neutral-100 flex"
  >
    <div class="w-1/3 pr-4">
      <p class="text-neutral-400 text-xs font-semibold mb-1">
        Requirement ID: {{props.assessment.requirementId}}
      </p>
      <lfx-project-security-evaluation-result
        size="small"
        type="transparent"
        :results="[props.assessment.result]"
      />
    </div>
    <div class="w-2/3">
      <p class="text-body-2">
        {{props.assessment.description}}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import LfxProjectSecurityEvaluationResult from "~/components/modules/project/components/security/evaluation-result.vue";
import type {SecurityAssessmentData} from "~~/types/security/responses.types";

const props = defineProps<{
  assessment: SecurityAssessmentData
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationAssesment',
}
</script>
