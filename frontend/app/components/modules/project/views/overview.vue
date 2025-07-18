<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <div
      class="flex justify-between pt-5 md:pt-10 lg:gap-10 gap-5 flex-col md:flex-row"
    >
      <div class="w-full md:w-3/4">
        <lfx-card class="py-6 flex flex-col md:gap-10 gap-5">
          <lfx-project-trust-score
            :trust-score-summary="trustSummary"
            :status="status"
            :error="error"
            :score-display="scoreDisplay"
            :is-repo-selected="isRepoSelected"
          />
          <div class="px-6">
            <lfx-project-score-tabs
              :trust-score-summary="trustSummary"
              :data="data"
              :status="status"
              :error="error"
              :score-display="scoreDisplay"
              :security-score="securityScore"
              :is-repo-selected="isRepoSelected"
            />
          </div>
        </lfx-card>
      </div>
      <div class="min-w-50 max-md:w-full w-1/4">
        <lfx-project-about-section />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
 computed, onServerPrefetch
} from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { WidgetArea } from '../../widget/types/widget-area';
import LfxProjectAboutSection from '~/components/modules/project/components/overview/about-section.vue';
import LfxProjectScoreTabs from '~/components/modules/project/components/overview/score-tabs.vue';
import LfxProjectTrustScore from '~/components/modules/project/components/overview/trust-score.vue';
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';

const route = useRoute();
const { selectedReposValues, project } = storeToRefs(useProjectStore())

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repos: selectedReposValues.value
}));

// Contributors score is only displayed if some contributors widgets are enabled
const displayContributorsScore = computed(() => isScoreVisible(WidgetArea.CONTRIBUTORS));

// Development score is only displayed if some development widgets are enabled
const displayDevelopmentScore = computed(() => isScoreVisible(WidgetArea.DEVELOPMENT));

// Popularity score is only displayed if some popularity widgets are enabled
const displayPopularityScore = computed(() => isScoreVisible(WidgetArea.POPULARITY));

// Security score is only displayed if security data is available
const displaySecurityScore = computed(() => securityScore.value && securityScore.value.length > 0);

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
  data, 
  status, 
  error, 
  suspense
} = OVERVIEW_API_SERVICE.fetchHealthScoreOverview(params);


const securityScore = computed(() => (data.value?.securityCategoryPercentage || []));

const trustSummary = computed<TrustScoreSummary>(() => ({
    overall: data.value?.overallScore || 0,
    popularity: data.value?.popularityPercentage || 0,
    contributors: data.value?.contributorPercentage || 0,
    security: data.value?.securityPercentage || 0,
    development: data.value?.developmentPercentage || 0
  }));

const isScoreVisible = (widgetArea: WidgetArea) => {
  const widgetKeys = OVERVIEW_API_SERVICE.getOverviewWidgetConfigs(widgetArea);
  return widgetKeys.some((widget) => project.value?.widgets?.includes(widget.key));
};

const isRepoSelected = computed(() => selectedReposValues.value.length > 0);

onServerPrefetch(async () => {
  await suspense();
});

</script>

<script lang="ts">
export default {
  name: 'LfxProjectOverviewView',
}
</script>
