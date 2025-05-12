<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tabs-panels>
    <lfx-tabs
      v-model="selectedTab"
      :tabs="tabs"
    >
      <template #slotItem="{ option }">
        <div class="flex flex-col gap-2 items-start">
          <div class="text-neutral-900 font-secondary font-bold text-sm">
            {{ option.label }}
          </div>
          <div class="text-sm text-gray-500 w-full">
            <lfx-progress-bar
              size="small"
              :values="[getValues(option.value)]"
              :color="getColor(getValues(option.value))"
            />
          </div>
        </div>
      </template>
    </lfx-tabs>
    <template
      v-for="tab in tabs"
      :key="tab.value"
    >
      <lfx-panels
        :class="tab.value === selectedTab ? 'block' : 'hidden'"
        class="p-6"
      >
        <lfx-project-score-list
          v-if="tab.value !== 'security'"
          :data="scoreData"
        />
        <lfx-project-security-score
          v-else
          :data="securityData"
        />
      </lfx-panels>
    </template>
  </lfx-tabs-panels>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxProjectScoreList from './score-list.vue';
import LfxPanels from '~/components/uikit/tabs/panels.vue';
import LfxTabsPanels from '~/components/uikit/tabs/tabs-panels.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import type { ScoreData } from '~~/types/shared/benchmark.types';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import LfxProjectSecurityScore from "~/components/modules/project/components/overview/security/security-score.vue";
import type { SecurityData } from '~~/types/security/responses.types';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  tabs: Tab[];
  modelValue: string;
  scoreData: ScoreData[] | undefined;
  securityData: SecurityData[];
}>();
const emit = defineEmits<{(e: 'update:modelValue', value: string): void
}>();

const selectedTab = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
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

  const score = props.trustScoreSummary[name as keyof TrustScoreSummary] || 0;
  return (score / 25) * 100;
};
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabView'
};
</script>
