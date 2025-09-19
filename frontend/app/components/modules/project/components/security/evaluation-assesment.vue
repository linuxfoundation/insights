<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="py-5 border-t first:border-0 border-neutral-100 flex gap-6"
  >
    <div class="min-w-27">
      <lfx-project-security-evaluation-result-tag
        size="small"
        :result="props.assessment.result"
        class="whitespace-nowrap"
      />
    </div>
    <div class="flex flex-grow gap-10">
      <div class="w-1/2">
        <p class="text-xs font-semibold mb-2">
          Requirement ID: {{props.assessment.requirementId}}
        </p>
        <p class="text-body-2 text-neutral-600">
          {{props.assessment.description}}
        </p>
      </div>
      <div class="w-1/2">
        <article v-if="props.assessment.recommendation && props.assessment.result !== 'Passed'">
          <div class="flex items-center gap-2 mb-2">
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

        </article>
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
