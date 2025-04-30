<template>
  <lfx-card class="p-4 sm:p-6 relative group">
    <lfx-widget-menu
      title="Contributors leaderboard"
      class="absolute -top-3 right-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible"
      :name="props.name"
    />
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">{{ config.name }}</h3>
    <p
      v-if="project"
      class="text-body-2 text-neutral-500 mb-5"
    >
      {{config.description(project)}}
      <a
        v-if="config.learnMoreLink"
        :href="config.learnMoreLink"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <component
      :is="config.component"
      @update:benchmark-value="emit('update:benchmark-value', $event)"
    />
  </lfx-card>
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

const emit = defineEmits<{(e: 'update:benchmark-value', value: Benchmark): void
}>();
const props = defineProps<{
  name: Widget
}>();

const { project } = storeToRefs(useProjectStore());

const config = computed<WidgetConfig>(() => lfxWidgets[props.name]);
</script>

<script lang="ts">
export default {
  name: 'LfxWidget'
}
</script>
