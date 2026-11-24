<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-project-about-section-loading :is-loading="isPending">
    <div
      v-if="summary && (isScored || empty)"
      class="flex flex-col gap-3 text-xs"
      data-testid="docs-readiness-tile"
    >
      <div class="text-neutral-400 font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
        AI docs readiness
        <lfx-tag
          type="outline"
          size="small"
          class="shrink-0"
        >
          Experimental
        </lfx-tag>
      </div>

      <template v-if="isScored">
        <div class="text-neutral-900">
          <p class="whitespace-nowrap">
            <span class="font-semibold">{{ summary.score }}</span>
            <span class="text-neutral-500"> / 100</span>
          </p>
          <p
            v-if="summary.median"
            class="mt-0.5 text-neutral-500"
          >
            {{ medianLead }}
            <span class="whitespace-nowrap">LF median ({{ summary.median.value }})</span>
          </p>
        </div>
        <div
          class="relative w-full"
          role="img"
          :aria-label="barLabel"
        >
          <lfx-progress-bar
            :values="[summary.score!]"
            color="normal"
          />
          <div
            v-if="summary.median"
            class="absolute -top-0.5 h-3 w-0.5 -translate-x-1/2 bg-neutral-700"
            :style="{ left: `${summary.median.value}%` }"
            data-testid="docs-readiness-median-marker"
          />
        </div>
        <p
          v-if="summary.biggestGap"
          class="break-words text-neutral-500"
        >
          Biggest gap:
          <span class="text-neutral-900">{{ summary.biggestGap.name }}</span>
          ·
          <span class="whitespace-nowrap">{{ summary.biggestGap.earned }} of {{ summary.biggestGap.weight }} pts</span>
        </p>
        <nuxt-link
          :to="breakdownLink"
          class="flex items-center gap-1 self-start text-brand-500 hover:underline"
        >
          View breakdown
          <lfx-icon
            name="arrow-right"
            :size="12"
          />
        </nuxt-link>
      </template>

      <template v-else-if="empty">
        <div>
          <p class="break-words text-neutral-900">{{ empty.title }}</p>
          <p class="mt-0.5 break-words text-neutral-500">{{ empty.body }}</p>
        </div>
        <lfx-button
          v-if="empty.suggest"
          type="transparent"
          class="!p-0 !text-xs !font-normal !text-brand-500 hover:!bg-transparent hover:underline self-start"
          @click="suggest"
        >
          Suggest a documentation URL
        </lfx-button>
      </template>
    </div>
  </lfx-project-about-section-loading>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { DOCS_READINESS_API_SERVICE } from '~/components/modules/project/services/docs-readiness.api.service';
import { useDocsReadinessCorrectionStore } from '~/components/modules/project/store/docs-readiness-correction.store';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import type { DocsReadinessState } from '~~/types/docs-readiness/readiness.types';

import LfxProjectAboutSectionLoading from './about-section/about-section-loading.vue';

const EMPTY_COPY: Partial<Record<DocsReadinessState, { title: string; body: string; suggest: boolean }>> = {
  'no-docs': {
    title: 'No documentation site found',
    body: 'We couldn’t find a docs website for this project.',
    suggest: true,
  },
  'repo-only': {
    title: 'Docs live in the code repository',
    body: 'Readiness is assessed for documentation websites only.',
    suggest: true,
  },
  'confirmed-no-docs': {
    title: 'No documentation site',
    body: 'The LF team confirmed this project has no documentation website.',
    suggest: false,
  },
  'not-evaluated': { title: 'Not evaluated yet', body: 'New projects are evaluated within a day.', suggest: false },
  failed: {
    title: 'Evaluation failed',
    body: 'We couldn’t evaluate this documentation site. We’ll retry tomorrow.',
    suggest: false,
  },
};

const route = useRoute();
const { project, selectedRepositoryGroup } = storeToRefs(useProjectStore());
const { openCorrection } = useDocsReadinessCorrectionStore();

const slug = computed(() => route.params.slug as string);
const { data: summary, isPending } = DOCS_READINESS_API_SERVICE.fetchSummary(slug);

// latest-failed carries the earlier success, so it renders as scored
const isScored = computed(
  () => summary.value?.score != null && ['scored', 'latest-failed'].includes(summary.value.state),
);
const empty = computed(() => (summary.value && !isScored.value ? EMPTY_COPY[summary.value.state] : undefined));

// "LF median (N)" renders in a nowrap span so "(N)" never wraps alone
const medianLead = computed(() => {
  const median = summary.value?.median;
  if (!median) return '';
  if (median.direction === 'equal') return 'At the';
  return `${median.delta} ${median.delta === 1 ? 'point' : 'points'} ${median.direction} the`;
});

const barLabel = computed(() =>
  summary.value?.median
    ? `Score ${summary.value.score} of 100; LF median ${summary.value.median.value}`
    : `Score ${summary.value?.score} of 100`,
);

// Same scope rule as the project menu tabs
const breakdownLink = computed(() => ({
  name: selectedRepositoryGroup.value
    ? LfxRoutes.REPOSITORY_GROUP_SECURITY
    : route.params.name
      ? LfxRoutes.REPOSITORY_SECURITY
      : LfxRoutes.PROJECT_SECURITY,
  query: { ...route.query, widget: undefined },
  hash: '#docs-readiness',
}));

const suggest = () => {
  if (!project.value || !summary.value) return;
  openCorrection({
    projectSlug: project.value.slug,
    projectName: project.value.name,
    currentDocsUrl: summary.value.docsUrl,
    state: summary.value.state,
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDocsReadinessTile',
};
</script>
