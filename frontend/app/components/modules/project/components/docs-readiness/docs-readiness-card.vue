<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card
    id="docs-readiness"
    class="p-4 sm:p-6 scroll-mt-[220px]"
  >
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 pb-2">
      <h2 class="text-heading-3 font-secondary font-bold">AI documentation readiness</h2>
      <lfx-tag
        size="small"
        type="outline"
        class="!border-neutral-500 !font-semibold !text-neutral-700 shrink-0"
      >
        Experimental
      </lfx-tag>
    </div>
    <p class="text-sm text-neutral-600">
      How easily AI agents can find, read and use this project's documentation site, assessed against the Agent-Friendly
      Docs checks.
      <a
        :href="links.docsReadiness"
        class="text-brand-500"
        target="_blank"
        rel="noopener noreferrer"
        >How we score this</a
      >
    </p>

    <div
      v-if="selectedReposValues.length"
      class="mt-4 p-3 bg-neutral-50 border-y border-neutral-100 flex items-start gap-2 rounded-md"
    >
      <lfx-icon
        name="info-circle"
        :size="16"
        class="text-neutral-500 shrink-0 mt-0.5"
      />
      <p class="text-xs text-neutral-600">Assessed for the project's documentation site, not per repository.</p>
    </div>

    <div
      v-if="banner"
      role="status"
      class="mt-4 p-3 bg-warning-50 text-warning-800 rounded-md text-sm flex items-start gap-2"
    >
      <lfx-icon
        name="triangle-exclamation"
        :size="16"
        class="shrink-0 mt-0.5"
      />
      <p class="min-w-0">{{ banner }}</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 pt-5">
      <div
        class="w-full min-w-0 flex flex-col gap-5"
        :class="summary && showAside ? 'lg:w-3/4 lg:border-r border-neutral-200 lg:pr-8' : ''"
      >
        <template v-if="summaryQuery.isPending.value">
          <div class="flex flex-wrap items-center gap-6">
            <lfx-skeleton
              shape="circle"
              size="7rem"
              class="shrink-0 rounded-full"
            />
            <div class="flex flex-col gap-2 flex-1 basis-56">
              <lfx-skeleton
                width="70%"
                height="1rem"
              />
              <lfx-skeleton
                width="50%"
                height="1rem"
              />
            </div>
          </div>
          <lfx-skeleton height="4rem" />
        </template>

        <div
          v-else-if="isUnavailable"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <lfx-icon
            name="eyes"
            class="text-neutral-300"
            :size="40"
          />
          <p class="text-neutral-500 text-body-1 pt-5">AI documentation readiness isn’t available right now.</p>
        </div>

        <template v-else>
          <lfx-project-docs-readiness-score
            v-if="hasScore"
            :summary="summary"
            :checks="checks"
          />
          <lfx-project-docs-readiness-evaluated-docs
            v-if="showUrlRow"
            :summary="summary"
            :pages-tested="hasScore && checks?.categories.length ? checks.pagesTested : null"
            :set-on="setOn"
            @correct="requestCorrection"
          />
          <lfx-project-docs-readiness-empty-state
            v-if="isEmptyState"
            :state="summary.state"
            :repo-url="summary.repoUrl"
            @correct="requestCorrection"
          />
          <lfx-project-docs-readiness-breakdown
            v-if="hasScore && checks?.categories.length"
            :categories="checks.categories"
          />
        </template>
      </div>

      <div
        v-if="summary && showAside"
        class="lg:w-1/4 w-full min-w-0"
      >
        <lfx-project-docs-readiness-aside
          :summary="summary"
          :history="history"
        />
      </div>
      <div
        v-else-if="summaryQuery.isPending.value"
        class="lg:w-1/4 w-full flex flex-col gap-3"
      >
        <lfx-skeleton
          width="60%"
          height="1rem"
        />
        <lfx-skeleton
          width="40%"
          height="1rem"
        />
        <lfx-skeleton height="9rem" />
      </div>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { useIsFetching } from '@tanstack/vue-query';
import { useNuxtApp, useRoute, useRouter } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onMounted, onServerPrefetch, onUnmounted, watch, type WatchStopHandle } from 'vue';

import LfxProjectDocsReadinessBreakdown from '~/components/modules/project/components/docs-readiness/breakdown.vue';
import LfxProjectDocsReadinessAside from '~/components/modules/project/components/docs-readiness/docs-readiness-aside.vue';
import LfxProjectDocsReadinessEmptyState from '~/components/modules/project/components/docs-readiness/docs-readiness-empty-state.vue';
import LfxProjectDocsReadinessEvaluatedDocs from '~/components/modules/project/components/docs-readiness/docs-readiness-evaluated-docs.vue';
import LfxProjectDocsReadinessScore from '~/components/modules/project/components/docs-readiness/docs-readiness-score.vue';
import { DOCS_READINESS_API_SERVICE } from '~/components/modules/project/services/docs-readiness.api.service';
import { failureBanner } from '~/components/modules/project/services/docs-readiness.service';
import { useDocsReadinessCorrectionStore } from '~/components/modules/project/store/docs-readiness-correction.store';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import useScroll from '~/components/shared/utils/scroll';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import { links } from '~/config/links';

const { project, selectedReposValues } = storeToRefs(useProjectStore());

const slug = computed(() => project.value?.slug ?? '');

const summaryQuery = DOCS_READINESS_API_SERVICE.fetchSummary(slug);
const historyQuery = DOCS_READINESS_API_SERVICE.fetchHistory(slug);
const checksQuery = DOCS_READINESS_API_SERVICE.fetchChecks(slug);

const summary = computed(() => summaryQuery.data.value);
const history = computed(() => (historyQuery.isError.value ? null : (historyQuery.data.value ?? null)));
const checks = computed(() => (checksQuery.isError.value ? null : (checksQuery.data.value ?? null)));

const hasOverride = computed(() => !!summary.value?.isOverride && !!summary.value?.docsUrl);
const contextQuery = DOCS_READINESS_API_SERVICE.fetchCorrectionContext(slug, hasOverride);
const setOn = computed(() => contextQuery.data.value?.override?.submittedAt ?? null);

const hasScore = computed(
  () => (summary.value?.state === 'scored' || summary.value?.state === 'latest-failed') && summary.value.score !== null,
);
const showUrlRow = computed(() => {
  const state = summary.value?.state;
  return (hasScore.value || state === 'failed') && !!summary.value?.docsUrl;
});
const isUnavailable = computed(
  () =>
    !summary.value ||
    (['scored', 'latest-failed'].includes(summary.value.state) && summary.value.score === null) ||
    (summary.value.state === 'failed' && !summary.value.docsUrl),
);
const isEmptyState = computed(
  () => !!summary.value && ['no-docs', 'confirmed-no-docs', 'repo-only', 'not-evaluated'].includes(summary.value.state),
);
const showAside = computed(() => !isUnavailable.value && !isEmptyState.value);
const banner = computed(() => (summary.value && !isUnavailable.value ? failureBanner(summary.value) : null));

const requestCorrection = () => {
  if (!project.value || !summary.value) return;
  useDocsReadinessCorrectionStore().openCorrection({
    projectSlug: project.value.slug,
    projectName: project.value.name,
    currentDocsUrl: summary.value.docsUrl,
    state: summary.value.state,
  });
};

const prefetch = async () => {
  await Promise.all([summaryQuery.suspense(), historyQuery.suspense(), checksQuery.suspense()]);
  // Awaiting a disabled query never settles, so only wait when the override is known
  if (hasOverride.value) await contextQuery.suspense();
};

onServerPrefetch(prefetch);

const route = useRoute();
const router = useRouter();
const { scrollToTarget } = useScroll();
const fetchingCount = useIsFetching();
const isHydrating = useNuxtApp().isHydrating;
const target = () => `${route.path}${route.hash}`;
let stopLanding: WatchStopHandle | undefined;
const stop = () => {
  stopLanding?.();
  stopLanding = undefined;
};
const finish = () => {
  landedOn = target();
  landing = null;
  stop();
};

// Content above loads after hydration, so land once everything settles, then stop
const armLanding = () => {
  stop();
  if (landedOn === target()) return;
  // A history entry left earlier carries its scroll, which the router restores instead
  if (window.history.state?.scroll) {
    finish();
    return;
  }
  // On first load, input since page start counts; the session survives query-change remounts
  if (landing?.target !== target()) landing = { target: target(), since: isHydrating ? 0 : performance.now() };
  const handle = watch(
    [() => summaryQuery.isPending.value, fetchingCount],
    ([pending, count]) => {
      if (pending || count > 0) return;
      nextTick(() => {
        if (stopLanding !== handle) return;
        const card = document.getElementById('docs-readiness');
        if (!card) return;
        if (!(landing && lastInputAt > landing.since)) scrollToTarget(card, undefined, 'instant');
        finish();
      });
    },
    { immediate: true },
  );
  stopLanding = handle;
};

let removeGuard: (() => void) | undefined;
onMounted(() => {
  removeGuard = router.beforeEach((to, from) => {
    if (to.path !== from.path || to.hash !== from.hash) {
      landedOn = null;
      landing = null;
    }
  });
  watch(
    () => route.hash,
    (hash) => (hash === '#docs-readiness' ? armLanding() : stop()),
    { immediate: true },
  );
});

onUnmounted(() => {
  removeGuard?.();
  stop();
});
</script>

<script lang="ts">
// Module scope: the page remounts on every query change, which must not land on the card again
let landedOn: string | null = null;
let landing: { target: string; since: number } | null = null;
let lastInputAt = -1;
// Listen from chunk load so input before the card hydrates still cancels the landing
if (import.meta.client) {
  const markInput = () => (lastInputAt = performance.now());
  ['wheel', 'touchmove', 'keydown', 'pointerdown', 'mousedown'].forEach((event) =>
    window.addEventListener(event, markInput, { passive: true, capture: true }),
  );
}

export default {
  name: 'LfxProjectDocsReadinessCard',
};
</script>
