<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tabs-panels>
    <lfx-tabs
      v-model="selectedTab"
      :tabs="tabsOptions"
    >
      <template #slotItem="{ option }">
        <lfx-tooltip
          class="!w-full"
          :allow-pass-through="true"
        >
          <template #content>
            <p
              v-if="!scoreDisplay[option.value as keyof typeof scoreDisplay]"
              class="max-w-60"
            >
              {{ option.label }} metrics are unavailable because the required data isn't available for this project.
              <a
                :href="links.securityScore"
                target="_blank"
                class="text-brand-500"
                >Learn more</a
              >
            </p>
            <p
              v-else
              class="max-w-60"
            >
              <a
                :href="links.securityScore"
                target="_blank"
                class="text-brand-500"
                >Learn more</a
              >
            </p>
          </template>
          <div
            class="flex flex-col gap-2 items-start"
            :class="{
              'cursor-not-allowed': !scoreDisplay[option.value as keyof typeof scoreDisplay],
            }"
          >
            <div
              class="text-sm tab-label"
              :class="{
                'text-neutral-400': !scoreDisplay[option.value as keyof typeof scoreDisplay],
                'text-neutral-900': scoreDisplay[option.value as keyof typeof scoreDisplay],
              }"
            >
              {{ option.label }}
            </div>
            <div class="text-sm text-gray-500 w-full">
              <lfx-skeleton-state
                :status="status"
                height=".188rem"
                width="100%"
              >
                <lfx-progress-bar
                  size="small"
                  :values="[getValues(option.value)]"
                  :color="getColor(getValues(option.value))"
                />
              </lfx-skeleton-state>
            </div>
          </div>
        </lfx-tooltip>
      </template>
    </lfx-tabs>
    <template
      v-for="tab in tabs"
      :key="tab.value"
    >
      <lfx-panels
        :class="tab.value === selectedTab ? 'block' : 'hidden'"
        class="pt-8"
      >
        <lfx-project-load-state
          :status="status"
          :error="error"
          error-message="Error fetching overview score data"
          loading-message="Loading Health score takeaways..."
        >
          <lfx-project-details-empty
            v-if="!scoreDisplay[tab.value as keyof typeof scoreDisplay]"
            :label="tab.label"
          />
          <lfx-project-score-list
            v-else-if="tab.value !== 'security'"
            :data="data"
            :name="tab.value as WidgetArea"
          />
          <lfx-project-security-score
            v-else
            :data="securityScore"
          />
        </lfx-project-load-state>
      </lfx-panels>
    </template>
  </lfx-tabs-panels>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectScoreList from './score-list.vue';
import LfxProjectDetailsEmpty from './details-empty.vue';
import LfxPanels from '~/components/uikit/tabs/panels.vue';
import LfxTabsPanels from '~/components/uikit/tabs/tabs-panels.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
import type { TrustScoreSummary, SecurityScore, HealthScoreResults } from '~~/types/overview/responses.types';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import LfxProjectSecurityScore from '~/components/modules/project/components/overview/security/security-score.vue';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import type { WidgetArea } from '~/components/modules/widget/types/widget-area';
import { links } from '~/config/links';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

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

const tabsOptions = computed(() => {
  return props.tabs.map((tab) => ({
    ...tab,
    disabled: !props.scoreDisplay[tab.value as keyof typeof props.scoreDisplay],
  }));
});

const getColor = (value: number) => {
  switch (true) {
    case value > 75:
      return 'positive' as ProgressBarType;
    case value > 25:
      return 'warning' as ProgressBarType;
    default:
      return 'negative' as ProgressBarType;
  }
};

const getValues = (name: string): number => {
  if (!props.trustScoreSummary) {
    return 0;
  }

  return props.trustScoreSummary[name as keyof TrustScoreSummary] || 0;
};
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabView',
};
</script>
