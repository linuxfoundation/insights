<template>
  <lfx-accordion-item
    name="access-control"
    class="py-5 border-t border-neutral-100"
    :reverse="true"
  >
    <div class="flex justify-between gap-4 w-full">
      <div v-if="props.checks.length">
        <h4 class="text-heading-4 font-bold font-secondary">
          {{props.checks[0]?.category}}
        </h4>
        <!--        <p class="text-body-2 text-neutral-500 mt-1">-->
        <!--          {{ props.checks[0]?.message }}-->
        <!--        </p>-->
      </div>
      <lfx-project-security-evaluation-result :results="assessmentsResults" />
    </div>

    <template #content>
      <div class="border border-neutral-200 rounded-md px-4 mt-4">
        <slot />
      </div>
    </template>
  </lfx-accordion-item>
</template>
<script setup lang="ts">
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
import LfxProjectSecurityEvaluationResult from "~/components/modules/project/components/security/evaluation-result.vue";
import type {SecurityAssessmentData, SecurityData} from "~~/types/security/responses.types";

const props = defineProps<{
  checks: SecurityData[]
}>()

const assessments = computed<SecurityAssessmentData[]>(() => props.checks.map((check) => check.assessments).flat());
const assessmentsResults = computed(() => assessments.value
    .map((assessment: SecurityAssessmentData) => assessment.result));

</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationSection',
}
</script>
