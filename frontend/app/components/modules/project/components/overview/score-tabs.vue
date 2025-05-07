<template>
  <div class="sm:block hidden">
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
            :score-data="tab.data"
          />
          <lfx-panels
            v-else
          >
            <div class="flex flex-col gap-6 p-6">
              <h1>Comming Soon</h1>
            </div>
          </lfx-panels>
        </lfx-panels>
      </template>
    </lfx-tabs-panels>
  </div>
  <div class="sm:hidden block">
    <lfx-card>
      <lfx-accordion
        v-model="selectedTab"
        class="p-5 -my-6"
      >
        <lfx-accordion-item
          v-for="tab in tabs"
          :key="tab.value"
          :name="tab.value"
          class="border-t border-neutral-100 pt-6"
        >
          <div class="text-sm leading-5 font-bold pb-6">
            {{ tab.label }}
          </div>
          <template #content>
            <div class="pb-6">
              <lfx-project-score-list
                v-if="tab.value !== 'security'"
                :score-data="tab.data"
              />
              <div
                v-else
                class="flex flex-col gap-6 p-6"
              >
                <h1>Comming Soon</h1>
              </div>
            </div>
          </template>
        </lfx-accordion-item>
      </lfx-accordion>
    </lfx-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxProjectScoreList from './score-details/score-list.vue';
import LfxPanels from '~/components/uikit/tabs/panels.vue';
import LfxTabsPanels from '~/components/uikit/tabs/tabs-panels.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
// import LfxAccordion from '~/components/uikit/accordion/accordion.vue';
// import LfxAccordionPanel from '~/components/uikit/accordion/accordion-panel.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
import {
  contributorsScoreData,
  popularityScoreData,
  developmentScoreData,
  scoreAggregates
} from '~~/server/mocks/score-data.mock';
import type {
  ScoreData
} from '~~/types/shared/benchmark.types';
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
import LfxCard from "~/components/uikit/card/card.vue";

const selectedTab = ref('contributors');

type ScoreTab = {
  label: string;
  value: string;
  data: ScoreData[];
}

const tabs = ref<ScoreTab[]>([
  { label: 'Contributors', value: 'contributors', data: contributorsScoreData },
  { label: 'Popularity', value: 'popularity', data: popularityScoreData },
  { label: 'Development', value: 'development', data: developmentScoreData },
  { label: 'Security & Best practices', value: 'security', data: [] }
]);

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
  const aggregate = scoreAggregates.find((aggregate) => aggregate.aggregateKey === name);
  return aggregate?.value || 0;
};
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabs'
};
</script>
