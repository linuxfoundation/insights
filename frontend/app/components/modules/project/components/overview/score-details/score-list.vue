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
      v-for="item in visibleData"
      :key="item.benchmarkKey"
      class="[&:not(:last-child)]:border-b border-neutral-100 [&:not(:last-child)]:pb-4"
    >
      <lfx-score-item
        :benchmark-key="item.benchmarkKey"
        :value="item.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxScoreItem from './score-item.vue';
import type { ScoreData } from '~~/types/shared/benchmark.types';
import {lfxWidgetArea, type WidgetAreaConfig} from "~/components/modules/widget/config/widget-area.config";
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import type { WidgetArea } from '~/components/modules/widget/types/widget-area';
import type {Widget} from "~/components/modules/widget/types/widget";
import { useProjectStore } from '~/components/modules/project/store/project.store';

const props = defineProps<{
  data: ScoreData[] | undefined;
  name: WidgetArea;
}>();
const { project, selectedRepoSlugs } = storeToRefs(useProjectStore())

const config = computed<WidgetAreaConfig>(() => lfxWidgetArea[props.name]);

const widgets = computed(() => (config.value.widgets || [])
  .filter((widget) => {
    const key = lfxWidgets[widget as Widget]?.key;
    const widgetConfig = lfxWidgets[widget as Widget];
    return (
      project.value?.widgets.includes(key)
      && (!widgetConfig?.hideOnRepoFilter || !selectedRepoSlugs.value.length)
    );
  }));

const visibleData = computed(() => props.data?.filter((item) => widgets.value.includes(item.benchmarkKey as unknown as Widget)));
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreList'
};
</script>
