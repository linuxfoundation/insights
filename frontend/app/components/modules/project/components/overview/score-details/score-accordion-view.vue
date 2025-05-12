<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <lfx-accordion
      v-model="selectedTab"
      class="p-5 -my-6"
    >
      <!-- <lfx-accordion v-model:value="active"> -->
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
          <div class="pb-6">
            <lfx-project-score-list
              v-if="tab.value !== 'security'"
              :data="scoreData"
            />
            <div
              v-else
              class="flex flex-col gap-6 p-6"
            >
              <lfx-project-security-score
                :data="securityData"
              />
            </div>
          </div>
        </template>
      </lfx-accordion-item>
    </lfx-accordion>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxProjectScoreList from './score-list.vue';
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
import LfxCard from "~/components/uikit/card/card.vue";
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';
import type { ScoreData } from '~~/types/shared/benchmark.types';
import type { SecurityData } from '~~/types/security/responses.types';
import LfxProjectSecurityScore from "~/components/modules/project/components/overview/security/security-score.vue";

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

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreAccordionView'
};
</script>
