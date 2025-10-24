<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-accordion
    v-model="selectedTab"
    class=""
  >
    <lfx-accordion-item
      v-for="tab in props.tabs"
      :key="tab.value"
      :name="tab.value"
      class="border-t border-neutral-100 pt-6"
    >
      <div class="text-sm leading-5 font-bold pb-6">
        {{ tab.label }}
      </div>
      <template #content>
        <lfx-project-load-state
          :status="status"
          :error="error"
          error-message="Error fetching overview score data"
          loading-message="Loading Health score takeaways..."
        >
          <div class="pb-6">
            <lfx-project-details-empty
              v-if="!scoreDisplay[tab.value as keyof typeof scoreDisplay]"
              :label="tab.label"
            />
            <lfx-project-score-list
              v-else-if="tab.value !== 'security'"
              :data="data"
              :name="tab.value as WidgetArea"
            />
            <div
              v-else
              class="pb-6"
            >
              <lfx-project-security-score :data="securityScore" />
            </div>
          </div>
        </lfx-project-load-state>
      </template>
    </lfx-accordion-item>
  </lfx-accordion>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectScoreList from './score-list.vue';
import LfxProjectDetailsEmpty from './details-empty.vue';
import LfxAccordion from '~/components/uikit/accordion/accordion.vue';
import LfxAccordionItem from '~/components/uikit/accordion/accordion-item.vue';
import type { TrustScoreSummary, SecurityScore, HealthScoreResults } from '~~/types/overview/responses.types';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import LfxProjectSecurityScore from '~/components/modules/project/components/overview/security/security-score.vue';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import type { WidgetArea } from '~/components/modules/widget/types/widget-area';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  tabs: Tab[];
  data: HealthScoreResults | undefined;
  modelValue: string;
  scoreDisplay: ScoreDisplay;
  securityScore: SecurityScore[];
  status: AsyncDataRequestStatus;
  error: unknown;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const selectedTab = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreAccordionView',
};
</script>
