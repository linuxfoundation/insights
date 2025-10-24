<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="linkUrl">
    <div class="flex flex-row gap-4">
      <div>
        <div
          :class="iconBGColor"
          class="rounded-full h-6 w-6 flex items-center justify-center"
        >
          <lfx-benchmark-icon
            :type="pointDetails?.type || 'positive'"
            use-triangle
            :size="12"
          />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="text-sm font-semibold text-neutral-900">
          {{ title }}
        </div>
        <div class="text-xs text-neutral-500">
          {{ description }}
        </div>
      </div>
      <!-- need to add this because tailwind won't import them in the computed property -->
      <span class="bg-negative-100 bg-positive-100 bg-warning-100" />
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import LfxBenchmarkIcon from '~/components/uikit/benchmarks/benchmark-icon.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';
import { lfxWidgetArea } from '~/components/modules/widget/config/widget-area.config';
import { Widget } from '~/components/modules/widget/types/widget';
import { lfProjectLinks } from '~/components/modules/project/config/links';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const props = defineProps<{
  widgetKey: string;
  value: number;
  benchmark: number;
}>();

const route = useRoute();
const repoName = computed(() => route.params.name as string);
const { selectedRepositoryGroup } = storeToRefs(useProjectStore());

const widget = computed(() => Object.values(lfxWidgets).find((w) => w.key === props.widgetKey));
const title = computed(() => widget.value?.benchmark?.title);
const benchmarkValue = computed(() => Math.ceil(props.value || 0));
const pointDetails = computed(() => widget.value?.benchmark?.points[props.benchmark]);
const description = computed(
  () => `
  ${pointDetails.value?.description.replace('{value}', formatNumber(benchmarkValue.value || 0).toString())} 
  - ${pointDetails.value?.text}`,
);
const iconBGColor = computed(() => `bg-${pointDetails.value?.type}-100`);
const widgetKebabCase = computed(() =>
  props.widgetKey
    ? (props.widgetKey.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() as Widget)
    : undefined,
);
const widgetArea = computed(() => {
  // Find the widget area where this widgetKey belongs to
  if (!widgetKebabCase.value) return undefined;
  // Go through each area and check if its widgets array includes this key
  for (const [area, config] of Object.entries(lfxWidgetArea)) {
    if (config.widgets && config.widgets.includes(widgetKebabCase.value)) {
      return area;
    }
  }
  return undefined;
});
const link = computed(() => lfProjectLinks.find((l) => l.key === widgetArea.value));
const linkUrl = computed(() => {
  if (!link.value) return undefined;

  const query = {
    ...route.query,
    widget: widgetKebabCase.value, // remove the widget from the query
  };
  let name = link.value.projectRouteName;
  if (selectedRepositoryGroup.value) {
    name = link.value.repoGroupRouteName;
  } else if (repoName.value) {
    name = link.value.repoRouteName;
  }

  return {
    name,
    query,
  };
});
</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreItem',
};
</script>
