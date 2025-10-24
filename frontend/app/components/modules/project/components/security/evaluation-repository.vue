<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="py-4 border-t first:border-0 border-neutral-100 flex sm:items-center flex-wrap gap-y-3 flex-col sm:flex-row"
  >
    <div class="w-20 pr-4">
      <lfx-project-security-evaluation-result
        size="small"
        :results="assessmentsResults"
      >
        <template #default="{ result }">
          <lfx-popover
            placement="top-start"
            trigger-event="hover"
          >
            <div class="flex items-center gap-2">
              <div class="h-4 w-4">
                <lfx-chart :config="chartConfig(result)" />
              </div>
              <p class="text-sm font-semibold">{{ result }}%</p>
            </div>

            <template #content>
              <lfx-card class="w-100 py-1 px-4 max-h-80 overflow-y-auto">
                <article
                  v-for="assessment of assessments"
                  :key="assessment.requirementId"
                  class="border-t border-neutral-100 first:border-0 py-3"
                >
                  <p class="text-xs font-semibold leading-4 text-neutral-400 mb-1">
                    Requirement ID: {{ assessment.requirementId }}
                  </p>
                  <lfx-project-security-evaluation-result-tag
                    size="small"
                    type="transparent"
                    :result="assessment.result"
                  />
                  <p class="text-body-2 mt-2">
                    {{ assessment.description }}
                  </p>
                </article>
              </lfx-card>
            </template>
          </lfx-popover>
        </template>
      </lfx-project-security-evaluation-result>
    </div>
    <div class="flex-grow">
      <div class="flex items-center gap-2">
        <lfx-icon
          name="book"
          :size="16"
          class="text-neutral-400"
        />
        <p class="text-body-2 whitespace-nowrap">
          {{ getRepoNameFromUrl(repository) }}
        </p>
      </div>
    </div>
    <div class="flex sm:justify-end items-center">
      <nuxt-link
        v-if="repo"
        :to="{ name: LfxRoutes.REPOSITORY_SECURITY, params: { name: repo.slug } }"
      >
        <lfx-button
          type="tertiary"
          size="small"
          class="whitespace-nowrap"
        >
          View repository breakdown
        </lfx-button>
      </nuxt-link>
    </div>
  </article>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { getRepoNameFromUrl } from '../../../repository/utils/repository.helpers';
import LfxProjectSecurityEvaluationResult from '~/components/modules/project/components/security/evaluation-result.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { SecurityAssessmentData, SecurityData } from '~~/types/security/responses.types';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxButton from '~/components/uikit/button/button.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxProjectSecurityEvaluationResultTag from '~/components/modules/project/components/security/evaluation-result-tag.vue';

const props = defineProps<{
  repository: string;
  checks: SecurityData[];
}>();

const { projectRepos } = storeToRefs(useProjectStore());

const repo = computed(() => projectRepos.value.find((repo) => repo.url === props.repository));

const assessments = computed<SecurityAssessmentData[]>(() => props.checks.map((check) => check.assessments).flat());
const assessmentsResults = computed(() =>
  assessments.value.map((assessment: SecurityAssessmentData) => assessment.result),
);

const chartConfig = (result: number) =>
  getGaugeChartConfig({
    value: result,
    gaugeType: 'full',
    name: '',
    graphOnly: true,
    lineColor: lfxColors.brand[500],
  });
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityEvaluationRepository',
};
</script>
