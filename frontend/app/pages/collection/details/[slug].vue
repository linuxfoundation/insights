<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white pb-30 -mb-30 flex-grow">
    <lfx-maintain-height
      :scroll-top="scrollTop"
      :class="scrollTop > 0 ? ['fixed', ...headerTopClass].join(' ') : 'relative'"
      class="z-10 w-full"
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
      />
    </lfx-maintain-height>
    <nuxt-page />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRequestFetch, createError, showError } from 'nuxt/app';
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

const route = useRoute();
const { slug } = route.params;
const requestFetch = useRequestFetch();
const { getCollectionSchema } = useRichSchema();
const { user } = storeToRefs(useAuthStore());
const queryClient = useQueryClient();
const { scrollTop } = useScroll();
const { headerTopClass } = storeToRefs(useBannerStore());

const queryKey = computed(() => [TanstackKey.COLLECTION, slug]);

const { data, isPending, suspense, isError, error } = useQuery<Collection>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(slug as string, requestFetch),
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
});

const { data: metrics, isLoading: isMetricsLoading } = useQuery<CollectionMetrics>({
  queryKey: computed(() => [TanstackKey.COLLECTION_METRICS, slug]),
  queryFn: COLLECTIONS_API_SERVICE.fetchCollectionMetrics(slug as string, requestFetch),
  retry: false,
});

const collectionType = computed(() => {
  if (user.value && user.value.sub === data.value?.ssoUserId) {
    return CollectionTypeEnum.MY_COLLECTIONS;
  }
  return data.value?.ssoUserId ? CollectionTypeEnum.COMMUNITY : CollectionTypeEnum.CURATED;
});

// Only LF Foundation (curated) collections show the in-depth aggregate tabs; Community and
// My Collections do not (per IN-1195's ticket text and confirmed with product).
const showsAggregateTabs = computed(() => collectionType.value === CollectionTypeEnum.CURATED);

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
