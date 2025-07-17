<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-benchmarks-wrap
    :benchmark-config="config.benchmark"
    :point="benchmarkScore?.benchmark || 0"
    :widget-model="model"
  >
    <lfx-card class="p-4 sm:p-6 relative group">
      <div class="flex justify-between items-center pb-3">
        <h3 class="text-heading-3 font-semibold font-secondary">{{ config.name }}</h3>
        <lfx-widget-menu
          :data="model"
          class="relative lg:absolute lg:-top-3 lg:right-6 lg:opacity-0
          lg:invisible group-hover:opacity-100 group-hover:visible"
          :name="props.name"
        />
      </div>
      <p
        v-if="project"
        class="text-body-2 text-neutral-500 mb-5"
      >
        <span v-html="sanitize(config.description(project))" />
        <a
          v-if="config.learnMoreLink"
          :href="config.learnMoreLink"
          class="ml-1 text-brand-500"
          target="_blank"
        >Learn more</a>
      </p>
      <hr>
      <component
        :is="config.component"
        v-model="model"
        @update:benchmark-value="emit('update:benchmark-value', $event)"
        @data-loaded="emit('dataLoaded', $event)"
      />
    </lfx-card>
  </lfx-benchmarks-wrap>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {storeToRefs} from "pinia";
import LfxCard from "~/components/uikit/card/card.vue";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets, type WidgetConfig} from "~/components/modules/widget/config/widget.config";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxWidgetMenu from "~/components/modules/widget/components/shared/widget-menu.vue";
import type { Benchmark } from '~~/types/shared/benchmark.types';
import {useSanitize} from "~~/composables/useSanitize";
import type { BenchmarkScoreData, HealthScoreResults } from '~~/types/overview/responses.types';
import LfxBenchmarksWrap from "~/components/uikit/benchmarks/benchmarks-wrap.vue";

const emit = defineEmits<{(e: 'dataLoaded', value: string): void;
  (e: 'update:benchmark-value', value: Benchmark): void
}>();
const props = defineProps<{
  name: Widget,
  benchmarkScores: HealthScoreResults | undefined
}>();

const {sanitize} = useSanitize();

const config = computed<WidgetConfig>(() => lfxWidgets[props.name]);

const model = ref(config.value.defaultValue || {})

const { project } = storeToRefs(useProjectStore());

const benchmarkScore = computed<BenchmarkScoreData | undefined>(() => props
  .benchmarkScores?.[config.value.key as keyof HealthScoreResults] as BenchmarkScoreData);
</script>

<script lang="ts">
export default {
  name: 'LfxWidget'
}
</script>
