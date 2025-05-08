<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="py-4 border-t first:border-0 border-neutral-100 flex items-center"
  >
    <div class="w-1/5 pr-4">
      <lfx-project-security-evaluation-result
        size="small"
        type="transparent"
        :results="assessmentsResults"
      />
    </div>
    <div class="w-4/5">
      <div class="flex items-center gap-2">
        <lfx-icon
          name="book"
          :size="16"
          class="text-neutral-400"
        />
        <p class="text-body-2">
          {{getRepoNameFromUrl(repository)}}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {getRepoNameFromUrl} from "../../../repository/utils/repository.helpers";
import LfxProjectSecurityEvaluationResult from "~/components/modules/project/components/security/evaluation-result.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import type {SecurityAssessmentData, SecurityData} from "~~/types/security/responses.types";

const props = defineProps<{
  repository: string,
  checks: SecurityData[]
}>();

const assessments = computed<SecurityAssessmentData[]>(() => props.checks.map((check) => check.assessments).flat());
const assessmentsResults = computed(() => assessments.value
    .map((assessment: SecurityAssessmentData) => assessment.result));

</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationRepository',
}
</script>
