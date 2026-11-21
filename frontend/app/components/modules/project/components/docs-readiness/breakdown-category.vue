<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-accordion-item
    :name="props.category.key"
    class="py-3.5 border-t border-neutral-200"
  >
    <div class="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2">
      <div class="relative h-11 w-11 flex-none">
        <lfx-chart
          :config="ringConfig"
          :animation="false"
        />
        <span
          class="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-neutral-900"
          data-test="pct"
          >{{ pctLabel }}</span
        >
      </div>
      <div class="flex-1 basis-40 min-w-0">
        <h4 class="text-heading-4 font-semibold font-secondary break-words">{{ props.category.name }}</h4>
        <p
          v-if="props.category.description"
          class="text-[13px] text-neutral-500 break-words"
        >
          {{ props.category.description }}
        </p>
      </div>
      <div class="w-full sm:w-auto sm:shrink-0 sm:text-right pl-[3.75rem] sm:pl-0">
        <p
          class="text-[13px] font-semibold"
          data-test="passed"
        >
          {{ passedLine }}
        </p>
        <p
          v-if="warnLine"
          class="text-xs text-warning-800"
          data-test="warn"
        >
          {{ warnLine }}
        </p>
        <p
          v-if="pointsLine"
          class="text-xs text-neutral-500"
          data-test="points"
        >
          {{ pointsLine }}
        </p>
      </div>
    </div>
    <template #content>
      <ul
        v-if="props.category.checks.length"
        class="mt-3.5 sm:ml-[3.75rem] flex flex-col gap-1.5"
      >
        <lfx-project-docs-readiness-breakdown-check
          v-for="check in props.category.checks"
          :key="check.id"
          :check="check"
        />
      </ul>
    </template>
  </lfx-accordion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LfxProjectDocsReadinessBreakdownCheck from '~/components/modules/project/components/docs-readiness/breakdown-check.vue';
import LfxAccordionItem from '~/components/uikit/accordion/accordion-item.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';
import type { DocsReadinessCategory } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  category: DocsReadinessCategory;
}>();

const unscored = computed(() => props.category.notAssessed || props.category.percent === null);
const pctLabel = computed(() => (unscored.value ? 'N/A' : `${props.category.percent}%`));
const ringConfig = computed(() =>
  getGaugeChartConfig({
    value: unscored.value ? 0 : (props.category.percent ?? 0),
    gaugeType: 'full',
    name: '',
    graphOnly: true,
    lineWidth: 4,
    lineColor: lfxColors.brand[500],
  }),
);
const passedLine = computed(() =>
  props.category.notAssessed
    ? 'Not assessed · full points'
    : `${props.category.passed} of ${props.category.applicable} checks passed`,
);
const warnLine = computed(() => {
  const n = props.category.needsAttention;
  return n > 0 ? `${n} ${n === 1 ? 'needs' : 'need'} attention` : '';
});
const pointsLine = computed(() =>
  props.category.points === null || props.category.weight === null
    ? ''
    : `${props.category.points} / ${props.category.weight} pts`,
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessBreakdownCategory',
};
</script>
