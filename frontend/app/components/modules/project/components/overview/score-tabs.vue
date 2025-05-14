<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-load-state
    :status="status"
    :error="error"
    error-message="Error fetching overview score data"
  >
    <div class="sm:block hidden">
      <lfx-project-score-tab-view
        :tabs="tabs"
        :trust-score-summary="parsedTrustScoreSummary"
        :model-value="selectedTab"
        :score-data="scoreData"
        :security-data="securityData"
        :score-display="scoreDisplay"
        @update:model-value="selectedTab = $event"
      />
    </div>
    <div class="sm:hidden block">
      <lfx-project-score-accordion-view
        :tabs="tabs"
        :trust-score-summary="parsedTrustScoreSummary"
        :model-value="selectedTab"
        :score-data="scoreData"
        :security-data="securityData"
        @update:model-value="selectedTab = $event"
      />
    </div>
  </lfx-project-load-state>
</template>

<script setup lang="ts">
import {
 ref, computed
} from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectScoreTabView from './score-details/score-tab-view.vue';
import LfxProjectScoreAccordionView from './score-details/score-accordion-view.vue';
import type { TrustScoreSummary, HealthScore } from '~~/types/overview/responses.types';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import { aggregateData } from '~~/app/components/modules/project/config/overview-aggregates';
import type { ScoreData } from '~~/types/shared/benchmark.types';
import type { SecurityData } from '~~/types/security/responses.types';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import { overviewScore } from '~~/app/components/shared/utils/overview-score';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  healthScores: HealthScore[] | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  securityData: SecurityData[];
  scoreDisplay: ScoreDisplay;
}>();

const tabs = ref<Tab[]>([
  { label: 'Contributors', value: 'contributors' },
  { label: 'Popularity', value: 'popularity' },
  { label: 'Development', value: 'development' },
  { label: 'Security & Best practices', value: 'security' }
]);
const selectedTab = ref(tabs.value[0]?.value || 'contributors');

const scoreData = computed<ScoreData[]>(() => {
  // Find the aggregate data for the selected tab
  const selectedAggregate = aggregateData.find((aggregate) => aggregate.key === selectedTab.value);

  // If no health scores or no aggregate found, return empty array
  if (!props.healthScores || !selectedAggregate) {
    return [];
  }

  // Filter scores that match benchmark keys in the same order as defined in aggregateData
  return selectedAggregate.benchmarkKeys
    .map((benchmarkKey) => {
      const score = props.healthScores?.find((s) => s.key === benchmarkKey);
      if (!score) return null;
      return {
        benchmarkKey: score.key,
        value: score.value
      };
    })
    .filter((score): score is ScoreData => score !== null);
});

const parsedTrustScoreSummary = computed(() => overviewScore(props.trustScoreSummary, props.scoreDisplay));

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabs'
};
</script>
