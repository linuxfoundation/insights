<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-neutral-50 rounded-lg px-4 py-3.5 flex flex-wrap items-start gap-x-4 gap-y-3">
    <lfx-icon
      name="globe"
      :size="20"
      class="text-neutral-600 shrink-0 mt-0.5"
    />
    <div class="flex-1 basis-56 min-w-0">
      <p class="text-xs text-neutral-500">Evaluated documentation</p>
      <div class="flex flex-wrap items-center gap-2 mt-0.5">
        <a
          v-if="isHttpUrl(summary.docsUrl)"
          :href="summary.docsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-brand-500 font-semibold [overflow-wrap:anywhere]"
        >
          {{ displayUrl(summary.docsUrl) }}
        </a>
        <span
          v-else
          class="font-semibold [overflow-wrap:anywhere]"
        >
          {{ summary.docsUrl }}
        </span>

        <lfx-tag
          v-if="summary.isOverride"
          size="small"
          variation="info"
          class="shrink-0 !h-6"
        >
          <lfx-icon
            name="shield-check"
            :size="12"
          />
          Confirmed by LF team
        </lfx-tag>
        <template v-else>
          <lfx-tag
            v-if="summary.discovery"
            size="small"
            type="outline"
            class="shrink-0"
          >
            {{ summary.discovery.label }}
          </lfx-tag>
          <lfx-tooltip
            v-if="summary.confidence"
            :content="summary.confidence.tooltip"
            :disabled="!summary.confidence.tooltip"
          >
            <lfx-tag
              size="small"
              type="outline"
              class="shrink-0"
            >
              {{ summary.confidence.label }}
            </lfx-tag>
          </lfx-tooltip>
        </template>
      </div>
      <p
        v-if="summary.isOverride"
        class="text-sm text-neutral-600 mt-1.5"
      >
        <template v-if="setOn">Set on {{ formatDay(setOn) }}. </template>This URL takes priority over automatic
        discovery.
      </p>
      <p
        v-if="pagesLine"
        class="text-xs text-neutral-500 mt-1.5"
      >
        {{ pagesLine }}
      </p>
    </div>
    <p class="text-[13px] text-neutral-600 max-w-full">
      {{ correction.prefix }}
      <lfx-button
        type="transparent"
        class="!p-0 !text-[13px] !font-semibold !text-brand-500 hover:!bg-transparent hover:underline max-w-full !whitespace-normal text-left !inline-flex !align-baseline"
        @click="emit('correct')"
      >
        {{ correction.label }}
      </lfx-button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { displayUrl, formatDay, isHttpUrl } from '~/components/modules/project/services/docs-readiness.service';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import type { DocsReadinessSummary } from '~~/types/docs-readiness/readiness.types';

const props = defineProps<{
  summary: DocsReadinessSummary;
  pagesTested: number | null;
  setOn: string | null;
}>();

const emit = defineEmits<{
  (e: 'correct'): void;
}>();

const correction = computed(() => {
  if (props.summary.isOverride) return { prefix: 'Still wrong?', label: 'Request another correction' };
  if (['failed', 'latest-failed'].includes(props.summary.state)) {
    return { prefix: 'Is the URL wrong?', label: 'Request a correction' };
  }
  return { prefix: null, label: 'Wrong URL? Request a correction' };
});

const pagesLine = computed(() => {
  if (!props.pagesTested) return null;
  if (props.pagesTested === 1) {
    return 'Based on 1 page tested. Only the docs landing page could be tested, so this score may not reflect the whole site.';
  }
  return `Based on ${props.pagesTested} pages tested.`;
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessEvaluatedDocs',
};
</script>
