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
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { WidgetArea } from '../../../widget/types/widget-area';
import LfxProjectScoreTabView from './score-details/score-tab-view.vue';
import LfxProjectScoreAccordionView from './score-details/score-accordion-view.vue';
import type {
  TrustScoreSummary,
  HealthScore,
  SecurityScore,
  HealthScoreResults,
} from '~~/types/overview/responses.types';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import { overviewScore } from '~~/app/components/shared/utils/overview-score';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  data: HealthScoreResults | undefined;
  healthScores: HealthScore[] | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  securityScore: SecurityScore[];
  scoreDisplay: ScoreDisplay;
}>();

const tabs = ref<Tab[]>([
  { label: 'Contributors', value: WidgetArea.CONTRIBUTORS },
  { label: 'Popularity', value: WidgetArea.POPULARITY },
  { label: 'Development', value: WidgetArea.DEVELOPMENT },
  { label: 'Security & Best practices', value: WidgetArea.SECURITY }
]);
const selectedTab = ref(tabs.value[0]?.value || WidgetArea.CONTRIBUTORS);

const parsedTrustScoreSummary = computed(() => overviewScore(props.trustScoreSummary, props.scoreDisplay));
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabs'
};
</script>
