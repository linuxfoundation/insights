<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="lg:block hidden">
    <lfx-project-score-tab-view
      :tabs="tabs"
      :trust-score-summary="parsedTrustScoreSummary"
      :model-value="selectedTab"
      :data="data"
      :score-display="scoreDisplay"
      :security-score="securityScore"
      :status="status"
      :error="error"
      @update:model-value="selectedTab = $event"
    />
  </div>
  <div class="lg:hidden block">
    <lfx-project-score-accordion-view
      :tabs="tabs"
      :trust-score-summary="parsedTrustScoreSummary"
      :data="data"
      :model-value="selectedTab"
      :score-display="scoreDisplay"
      :security-score="securityScore"
      :status="status"
      :error="error"
      @update:model-value="selectedTab = $event"
    />
  </div>
</template>

<script setup lang="ts">
import {
 ref, computed
} from 'vue';
import { storeToRefs } from 'pinia';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { WidgetArea } from '../../../widget/types/widget-area';
import { OVERVIEW_API_SERVICE } from '../../services/overview.api.service';
import LfxProjectScoreTabView from './score-details/score-tab-view.vue';
import LfxProjectScoreAccordionView from './score-details/score-accordion-view.vue';
import type {
  TrustScoreSummary,
  SecurityScore,
  HealthScoreResults,
  BenchmarkScoreData
} from '~~/types/overview/responses.types';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import { overviewScore } from '~~/app/components/shared/utils/overview-score';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';

const { project, selectedRepoSlugs } = storeToRefs(useProjectStore())

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  data: HealthScoreResults | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  securityScore: SecurityScore[];
  scoreDisplay: ScoreDisplay;
  isRepoSelected: boolean;
}>();

const tabs = ref<Tab[]>([
  { label: 'Contributors', value: WidgetArea.CONTRIBUTORS },
  { label: 'Popularity', value: WidgetArea.POPULARITY },
  { label: 'Development', value: WidgetArea.DEVELOPMENT },
  { label: 'Security & Best practices', value: WidgetArea.SECURITY }
]);
const selectedTab = ref(tabs.value[0]?.value || WidgetArea.CONTRIBUTORS);

const parsedTrustScoreSummary = computed(() => {
  const scoreFromData = overviewScore(props.trustScoreSummary, props.scoreDisplay);

  if (props.isRepoSelected) {
    return {...repoTrustScoreSummary.value, security: scoreFromData.security};
  }

  return scoreFromData;
});

const repoTrustScoreSummary = computed(() => {
  const contributorWidgets = getWidgets(WidgetArea.CONTRIBUTORS);
  const popularityWidgets = getWidgets(WidgetArea.POPULARITY);
  const developmentWidgets = getWidgets(WidgetArea.DEVELOPMENT);

  const contributorScores = getTotalScore(contributorWidgets);
  const popularityScores = getTotalScore(popularityWidgets);
  const developmentScores = getTotalScore(developmentWidgets);

  return {
    overall: 0,
    popularity: ((popularityScores / popularityWidgets.length * 5) / 25) * 100,
    contributors: (contributorScores / contributorWidgets.length * 5) / 25 * 100,
    security: 0,
    development: (developmentScores / developmentWidgets.length * 5) / 25 * 100,
  };
});

const getWidgets = (widgetArea: WidgetArea) => {
  return OVERVIEW_API_SERVICE.getOverviewWidgetConfigs(widgetArea)
  .filter((widget) => {
    return (
      project.value?.widgets.includes(widget.key)
      && (!widget?.hideOnRepoFilter || !selectedRepoSlugs.value.length)
    );
  });
}

const getTotalScore = (widgets: WidgetConfig[]) => {
  let total = 0;

  widgets.forEach((widget) => {
    const score = props.data?.[widget.key as keyof HealthScoreResults];
    if (score) {
      const scoreData = score as BenchmarkScoreData;
      total += scoreData.benchmark;
    }
  });

  return total;
}
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabs'
};
</script>
