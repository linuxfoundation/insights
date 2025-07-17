<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="data"
    class="flex flex-col gap-4"
  >
    <div
      v-for="item in scoresData"
      :key="item?.key"
      class="[&:not(:last-child)]:border-b border-neutral-100 [&:not(:last-child)]:pb-4"
    >
      <lfx-score-item
        v-if="item"
        :widget-key="item.key"
        :value="item.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { OVERVIEW_API_SERVICE } from '../../../services/overview.api.service';
import LfxScoreItem from './score-item.vue';
import type { BenchmarkScoreData, HealthScoreResults } from '~~/types/overview/responses.types';
import type { WidgetArea } from '~/components/modules/widget/types/widget-area';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const props = defineProps<{
  data: HealthScoreResults | undefined;
  name: WidgetArea;
}>();
const { project, selectedRepoSlugs } = storeToRefs(useProjectStore())

const widgetConfigs = computed(() => OVERVIEW_API_SERVICE.getOverviewWidgetConfigs(props.name)
  .filter((widget) => {
    return (
      project.value?.widgets.includes(widget.key)
      && (!widget?.hideOnRepoFilter || !selectedRepoSlugs.value.length)
    );
  }));

/**
 * Widget keys stored in the DB are camelCase, but the widget in the widget 
 * area configs are kebab-case, so is the enum that we use to match the widget
 */
const scoresData = computed(() => widgetConfigs.value.map((widget) => {
  const score = props.data?.[widget.key as keyof HealthScoreResults];

  if (score) {
    const scoreData = score as BenchmarkScoreData;
    return {
      key: widget.key,
      point: OVERVIEW_API_SERVICE.getPointDetails(scoreData.value, widget.key),
      value: scoreData.value,
      benchmark: scoreData.benchmark,
    };
  }
  return null;
}).sort((a, b) => (b?.point?.points || 0) - (a?.point?.points || 0)));
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreList'
};
</script>
