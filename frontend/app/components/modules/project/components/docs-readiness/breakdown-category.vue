<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-accordion-item
    :name="props.category.key"
    class="py-4 sm:py-5 border-t border-neutral-200"
  >
    <div class="flex flex-wrap sm:flex-nowrap items-start gap-x-4 gap-y-2">
      <div class="relative h-12 w-12 min-w-12 flex-none">
        <lfx-chart
          :config="ringConfig"
          :animation="false"
        />
        <span
          v-if="unscored"
          class="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-neutral-900"
          data-test="pct"
          >N/A</span
        >
      </div>
      <div class="flex-1 basis-40 min-w-0">
        <h4 class="text-heading-4 font-bold font-secondary break-words">{{ props.category.name }}</h4>
        <p
          v-if="props.category.description"
          class="text-body-2 text-neutral-500 mt-1 break-words"
        >
          {{ props.category.description }}
        </p>
      </div>
      <div class="w-full sm:w-auto sm:shrink-0 sm:text-right pl-16 sm:pl-0">
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
        class="mt-4 sm:ml-16 flex flex-col gap-1.5"
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
const ringConfig = computed(() =>
  getGaugeChartConfig({
    value: unscored.value ? 0 : (props.category.percent ?? 0),
    gaugeType: 'full',
    name: '',
    graphOnly: unscored.value,
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
