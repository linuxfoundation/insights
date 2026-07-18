<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pb-30 -mb-30 flex-grow">
    <lfx-maintain-height
      :scroll-top="scrollTop"
      :class="scrollTop > 0 ? ['fixed', ...headerTopClass].join(' ') : 'relative'"
      class="z-10 w-full bg-white"
      :loaded="!isPending"
    >
      <lfx-collection-header
        :loading="isPending"
        :collection="data"
        :only-lf-projects="isLFOnly"
        :type="collectionType"
        :metrics="metrics"
        :metrics-loading="isMetricsLoading"
        @update:only-lf-projects="updateOnlyLFProjects"
        @updated="handleCollectionUpdated"
      />
      <lfx-collection-menu
        v-if="!isPending && showsAggregateTabs"
        :slug="slug as string"
        :show-date-range-picker="isAggregateWidgetTab"
      />
    </lfx-maintain-height>
    <nuxt-page />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRequestFetch, createError, showError, navigateTo, useNuxtApp } from 'nuxt/app';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch, onServerPrefetch } from 'vue';
import { storeToRefs } from 'pinia';
import type { Collection, CollectionMetrics } from '~~/types/collection';
import LfxCollectionHeader from '~/components/modules/collection/components/details/header.vue';
import LfxCollectionMenu from '~/components/modules/collection/components/details/collection-menu.vue';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useRichSchema } from '~~/composables/useRichSchema';
import { CollectionTypeEnum } from '~/components/modules/collection/config/collection-type-config';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { useBannerStore } from '~/components/shared/store/banner.store';
import useScroll from '~/components/shared/utils/scroll';
import { useQueryParam, type URLParams } from '~/components/shared/utils/query-param';
import {
  collectionDetailsParamsGetter,
  collectionListParamsSetter,
} from '~/components/modules/collection/services/collections.query.service';
import {
  useProjectStore,
  defaultTimeRangeKey,
  defaultDateOption,
} from '~/components/modules/project/store/project.store';
import { LfxRoutes } from '~/components/shared/types/routes';
import { processProjectParams, projectParamsSetter } from '~/components/modules/project/services/project.query.service';

const route = useRoute();
const { slug } = route.params;
const requestFetch = useRequestFetch();
const nuxtApp = useNuxtApp();
const { getCollectionSchema } = useRichSchema();
const { user } = storeToRefs(useAuthStore());
const queryClient = useQueryClient();
const { scrollTop } = useScroll();
const { headerTopClass } = storeToRefs(useBannerStore());
const { selectedTimeRangeKey, startDate, endDate } = storeToRefs(useProjectStore());
const { queryParams: dateQueryParams } = useQueryParam(processProjectParams, projectParamsSetter);

// The date-range picker only makes sense on the widget-driven aggregate tabs (Contributors,
// Popularity, Development) - the Projects tab is a plain project list with no date-scoped data.
const aggregateWidgetTabRoutes: string[] = [
  LfxRoutes.COLLECTION_CONTRIBUTORS,
  LfxRoutes.COLLECTION_POPULARITY,
  LfxRoutes.COLLECTION_DEVELOPMENT,
];
const isAggregateWidgetTab = computed(() => aggregateWidgetTabRoutes.includes(route.name as string));

const queryKey = computed(() => [TanstackKey.COLLECTION, slug]);

const { data, isPending, suspense, isError, error } = useQuery<Collection>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(slug as string, requestFetch),
  retry: false,
});

let lastCollectionId: string | undefined;

// Mirrors project/[slug].vue's date-range initialization: without this, useProjectStore's
// startDate/endDate refs are only ever seeded once at store-creation time and never picked up
// from the URL on this route, so every widget on a collection page defaulted to "since 2010".
watch(
  () => data.value,
  (value) => {
    if (value && lastCollectionId !== value.id) {
      lastCollectionId = value.id;

      if (!dateQueryParams.value.timeRange) {
        selectedTimeRangeKey.value = defaultTimeRangeKey;
        startDate.value = defaultDateOption?.startDate || null;
        endDate.value = defaultDateOption?.endDate || null;

        dateQueryParams.value = {
          timeRange: selectedTimeRangeKey.value,
          start: startDate.value,
          end: endDate.value,
        };
      }
    }
  },
  { immediate: true },
);

const collectionType = computed(() => {
  if (user.value && user.value.sub === data.value?.ssoUserId) {
    return CollectionTypeEnum.MY_COLLECTIONS;
  }
  return data.value?.ssoUserId ? CollectionTypeEnum.COMMUNITY : CollectionTypeEnum.CURATED;
});

// Only LF Foundation (curated) collections show the in-depth aggregate tabs; Community and
// My Collections do not (per IN-1195's ticket text and confirmed with product).
const showsAggregateTabs = computed(() => collectionType.value === CollectionTypeEnum.CURATED);

// The tab nav already hides these links for non-curated collections, but the routes themselves
// were still directly reachable (e.g. a bookmarked or shared URL) - redirect back to the
// Projects tab so a non-curated collection can't render tabs its own nav never offers.
//
// navigateTo() needs Nuxt's async context (useRouter/useNuxtApp internally). TanStack Query's
// data ref is updated via notifyManager's setTimeout(fn, 0) scheduling, not a promise chain
// Nuxt's context-tracking spans, so calling navigateTo() directly from this watcher's callback
// can silently no-op or throw depending on timing - reproduced as a hard 500 in testing.
// nuxtApp.runWithContext() (captured synchronously above, in <script setup>) deterministically
// re-establishes Nuxt's context for the closure regardless of what scheduled the callback -
// the same pattern Nuxt core itself uses for its own router navigateTo() calls.
watch(
  [() => data.value, isAggregateWidgetTab],
  ([value]) => {
    // Guard against a stale/cross-collection cache hit: only redirect using data that's
    // actually for the collection this page instance was created for, in case a background
    // refetch resolves for a different query key than the one this closure captured `slug` from.
    //
    // isAggregateWidgetTab is also watched (not just data) because the parent layout stays
    // mounted across child-tab navigation - once data has already loaded, switching tabs
    // client-side changes isAggregateWidgetTab without data changing, and a watcher keyed on
    // data alone would never re-run the guard for that navigation.
    if (value && value.slug === slug && !showsAggregateTabs.value && isAggregateWidgetTab.value) {
      nuxtApp.runWithContext(() =>
        navigateTo({ name: LfxRoutes.COLLECTION, params: { slug: slug as string } }, { replace: true }),
      );
    }
  },
  { immediate: true },
);

const {
  data: metrics,
  isLoading: isMetricsLoading,
  suspense: metricsSuspense,
} = useQuery<CollectionMetrics>({
  queryKey: computed(() => [TanstackKey.COLLECTION_METRICS, slug]),
  queryFn: COLLECTIONS_API_SERVICE.fetchCollectionMetrics(slug as string, requestFetch),
  retry: false,
});

// This is the parent layout for all 4 collection detail routes (Projects, Contributors,
// Popularity, Development), so the collection 404 must be handled here rather than only in
// the Projects child view - otherwise the other 3 routes would render a blank header/empty
// widgets for an invalid or inaccessible slug instead of the collection 404 page.
onServerPrefetch(async () => {
  await suspense();
  if (isError.value) {
    const statusMessage = error.value?.message || 'Collection Not Found';

    if (import.meta.server) {
      throw createError({ statusCode: 404, statusMessage });
    } else {
      showError({ statusCode: 404, statusMessage });
    }
  }

  // Resolve the header metrics query during SSR too, otherwise on a sub-tab refresh
  // (Contributors/Popularity/Development) the server ships isMetricsLoading=true and the
  // client never re-runs the query, leaving the header metric chips stuck on skeletons.
  // Awaited after the 404 check so a metrics failure never blocks the collection 404 path;
  // metrics.ts already degrades gracefully on upstream error, so this can't hang the page.
  await metricsSuspense();
});

// Only Linux Foundation projects toggle: per Figma this is visually part of the shared header,
// which now lives here above all 4 tabs. Reads/writes the same `onlyLFProjects` route query
// param that collection-details.vue (Projects tab) uses, so both share one source of truth -
// toggling here updates the Projects request, and navigating with `?onlyLFProjects=true` is
// reflected back in this toggle.
const { queryParams } = useQueryParam(collectionDetailsParamsGetter, collectionListParamsSetter);
const isLFOnly = ref(queryParams.value.onlyLFProjects === 'true');

const updateOnlyLFProjects = (value: boolean) => {
  queryParams.value = {
    collectionSort: queryParams.value.collectionSort,
    onlyLFProjects: value ? 'true' : undefined,
  };
  isLFOnly.value = value;
};

// Keeps isLFOnly in sync when the query param changes externally (e.g. browser back/forward
// removing `?onlyLFProjects`). A missing param means "false", not "leave unchanged".
watch(
  () => queryParams.value,
  (value: URLParams) => {
    const onlyLFParam = value.onlyLFProjects === 'true';
    if (onlyLFParam !== isLFOnly.value) {
      isLFOnly.value = onlyLFParam;
    }
  },
);

const handleCollectionUpdated = (collection: Collection) => {
  queryClient.setQueryData(queryKey.value, collection);
};

const title = computed(() => `${data.value?.name || 'Collection'} Insights`);

const description = computed(() => {
  const desc = data.value?.description || '';
  if (!desc) return '';

  const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];

  if (sentences[0] && sentences[0].trim().length <= 160) {
    return sentences[0].trim();
  }

  if (sentences.length > 1) {
    const twoSentences = (sentences[0] + ' ' + sentences[1]).trim();
    if (twoSentences.length <= 160) {
      return twoSentences;
    }
  }

  return desc.substring(0, 157).trim() + '...';
});

defineOgImageComponent('collection', {
  collectionSlug: slug as string,
});

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});

useHead(getCollectionSchema(data));
</script>
