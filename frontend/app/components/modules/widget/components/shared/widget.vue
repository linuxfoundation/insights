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
          :class="{'!opacity-100 !visible': isMenuOpen}"
          :name="props.name"
          :is-menu-open="isMenuOpen"
          @update:is-menu-open="isMenuOpen = $event"
        />
      </div>
      <div class="mb-5 flex items-end justify-between gap-8 sm:flex-row flex-col">
        <p
          v-if="project"
          class="text-body-2 text-neutral-500"
        >
          <span v-html="sanitize(config.description(project))" />
          <a
            v-if="config.learnMoreLink"
            :href="config.learnMoreLink"
            class="ml-1 text-brand-500"
            target="_blank"
          >Learn more</a>
        </p>
        <div
          v-if="config.showCollabToggle"
          class="flex items-center gap-1"
        >
          <lfx-toggle
            v-model="includeCollaborations"
            size="small"
          >
            Include collaborations
          </lfx-toggle>
          <lfx-tooltip>
            <template #content>
              <p>
                Collaborations refer to activities associated with engagement or<br>coordination with others, 
                and don’t reflect technical-driven<br>impact. 
                <a
                  :href="links.collaborationDocs"
                  target="_blank"
                  class="text-brand-500"
                >Learn more</a>
              </p>
            </template>
            <lfx-icon
              name="question-circle"
              :size="13"
              class="text-neutral-400"
            />
          </lfx-tooltip>
        </div>
      </div>
      <hr>
      <component
        :is="config.component"
        v-model="model"
        @data-loaded="emit('dataLoaded', $event)"
      />
    </lfx-card>
  </lfx-benchmarks-wrap>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import LfxCard from "~/components/uikit/card/card.vue";
import type {Widget} from "~/components/modules/widget/types/widget";
import {lfxWidgets, type WidgetConfig} from "~/components/modules/widget/config/widget.config";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxWidgetMenu from "~/components/modules/widget/components/shared/widget-menu.vue";
import {useSanitize} from "~~/composables/useSanitize";
import type { BenchmarkScoreData, HealthScoreResults } from '~~/types/overview/responses.types';
import LfxBenchmarksWrap from "~/components/uikit/benchmarks/benchmarks-wrap.vue";
import LfxToggle from "~/components/uikit/toggle/toggle.vue";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { links } from '~/config/links';

const emit = defineEmits<{(e: 'dataLoaded', value: string): void;
}>();
const props = defineProps<{
  name: Widget,
  benchmarkScores: HealthScoreResults | undefined
}>();

const {sanitize} = useSanitize();

const config = computed<WidgetConfig>(() => lfxWidgets[props.name]);

const model = ref(config.value.defaultValue || {});
const includeCollaborations = computed({
  get: () => model.value.includeCollaborations || false,
  set: (value) => {
    model.value.includeCollaborations = value;
  }
});
const isMenuOpen = ref(false);

const { project } = storeToRefs(useProjectStore());

const benchmarkScore = computed<BenchmarkScoreData | undefined>(() => props
  .benchmarkScores?.[config.value.key as keyof HealthScoreResults] as BenchmarkScoreData);
</script>

<script lang="ts">
export default {
  name: 'LfxWidget'
}
</script>
