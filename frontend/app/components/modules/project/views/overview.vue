<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container !px-5 lg:!px-10">
    <div
      v-if="!fakeLoading"
      class="flex justify-between pt-5 md:pt-10 gap-10 flex-col md:flex-row"
    >
      <div class="w-full md:w-3/4 pb-6 md:pb-10 flex flex-col gap-8">
        <div>
          <lfx-project-trust-score
            :trust-score-summary="trustSummary"
            :status="status"
            :error="error"
            :score-display="scoreDisplay"
          />
        </div>
        <div>
          <lfx-project-score-tabs
            :trust-score-summary="trustSummary"
            :health-scores="healthScore"
            :status="status"
            :error="error"
            :security-data="securityAssessmentData || []"
            :score-display="scoreDisplay"
          />
        </div>
      </div>
      <div class="pr-5 min-w-50 xl:pr-10 max-md:w-full w-1/4">
        <lfx-project-about-section />
      </div>
    </div>
    <div
      v-else
      class="flex justify-center items-center h-[600px]"
    >
      <lfx-spinner
        :size="40"
        class="text-neutral-300"
        :type="'light'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
 computed, onMounted, onServerPrefetch, ref
} from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { lfxWidgetArea } from '../../widget/config/widget-area.config';
import { lfxWidgets } from '../../widget/config/widget.config';
import LfxProjectAboutSection from '~/components/modules/project/components/overview/about-section.vue';
import LfxProjectScoreTabs from '~/components/modules/project/components/overview/score-tabs.vue';
import LfxProjectTrustScore from '~/components/modules/project/components/overview/trust-score.vue';
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';
import {PROJECT_SECURITY_SERVICE} from "~/components/modules/project/services/security.service";
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';

const fakeLoading = ref(true);
const route = useRoute();
const { selectedRepository, project } = storeToRefs(useProjectStore())

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value
}));

// Contributors score is only displayed if all contributors widgets are enabled
const displayContributorsScore = computed(() => {
  const widgets = project.value?.widgets;

  return (lfxWidgetArea.contributors.overviewWidgets || [])
    .map((widget) => lfxWidgets[widget].key)
    .every((widget) => widgets?.includes(widget));
});

// Development score is only displayed if all development widgets are enabled
const displayDevelopmentScore = computed(() => {
  const widgets = project.value?.widgets;

  return (lfxWidgetArea.development.overviewWidgets || [])
    .map((widget) => lfxWidgets[widget].key)
    .every((widget) => widgets?.includes(widget));
});

// Popularity score is only displayed if all popularity widgets are enabled
const displayPopularityScore = computed(() => {
  const widgets = project.value?.widgets;

  return (lfxWidgetArea.popularity.overviewWidgets || [])
    .map((widget) => lfxWidgets[widget].key)
    .every((widget) => widgets?.includes(widget));
});

// Security score is only displayed if security data is available
const displaySecurityScore = computed(() => !!ospsScore.value);

const scoreDisplay = computed(() => ({
  overall: displayContributorsScore.value
    && displayDevelopmentScore.value
    && displayPopularityScore.value
    && displaySecurityScore.value,
  contributors: displayContributorsScore.value,
  development: displayDevelopmentScore.value,
  popularity: displayPopularityScore.value,
  security: displaySecurityScore.value,
}))

const {
  data, status: healthScoreStatus, error: healthScoreError, suspense
} = OVERVIEW_API_SERVICE.fetchHealthScore(params);

const {
  data: securityAssessmentData,
  status: securityAssessmentStatus,
  error: securityAssessmentError, suspense: securityAssessmentSuspense
} = OVERVIEW_API_SERVICE.fetchSecurityAssessment(params);

const status = computed<AsyncDataRequestStatus>(() => {
  if (healthScoreStatus.value === 'success' && securityAssessmentStatus.value === 'success') {
    return 'success';
  }
  if (healthScoreStatus.value === 'error' || securityAssessmentStatus.value === 'error') {
    return 'error';
  }

  return 'pending';
});
const error = computed(() => healthScoreError.value || securityAssessmentError.value);

const healthScore = computed(() => (data.value
  ? OVERVIEW_API_SERVICE.convertRawValuesToHealthScore(data.value) : []));

const ospsScore = computed(() => PROJECT_SECURITY_SERVICE
  .calculateOSPSScore((securityAssessmentData.value || []), !!selectedRepository.value));

const trustSummary = computed<TrustScoreSummary>(() => (healthScore.value
  ? OVERVIEW_API_SERVICE.convertPointsToTrustSummary(healthScore.value, ospsScore.value) : {
    overall: 0,
    popularity: 0,
    contributors: 0,
    security: 0,
    development: 0
  }));

onServerPrefetch(async () => {
  await suspense();
  await securityAssessmentSuspense();
});

onMounted(() => {
  setTimeout(() => {
    fakeLoading.value = false;
  }, 200);
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOverviewView',
}
</script>
