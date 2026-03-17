<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-maintain-height
    :scroll-top="scrollTop"
    :loaded="!loading"
    :class="scrollTop > 0 ? ['fixed', ...headerTopClass].join(' ') : 'relative'"
    class="z-10 w-lvw ml-auto mr-0"
  >
    <div class="bg-white outline outline-neutral-100">
      <lfx-collection-header
        :loading="loading"
        :collection="currentCollection"
        :only-lf-projects="isLFOnly"
        :sort="sort"
        :type="collectionType"
        @update:only-lf-projects="updateOnlyLFProjects"
        @update:sort="updateSort"
        @updated="handleCollectionUpdated"
      />
    </div>
  </lfx-maintain-height>

  <div class="container pb-5 lg:pb-10 flex flex-col">
    <div
      v-if="!isPending && flatData.length"
      class="flex flex-col"
    >
      <lfx-collection-project-item
        v-for="project in flatData"
        :key="project.slug"
        :project="project"
      />
    </div>

    <div
      v-if="flatData.length === 0 && isSuccess"
      class="flex flex-col items-center py-20"
    >
      <lfx-icon
        name="face-monocle"
        :size="80"
        class="text-neutral-300"
      />
      <h3 class="text-center pt-5 text-heading-3 sm:text-heading-2 font-secondary font-bold text-neutral-500">
        No projects found
      </h3>
      <p class="text-body-1 text-neutral-500 pt-3 text-center">
        Try adjusting your filters to find what you’re looking for.
      </p>
    </div>

    <div
      v-if="isPending || isFetchingNextPage"
      class="flex flex-col"
    >
      <lfx-collection-project-item-loading
        v-for="i in 6"
        :key="i"
      />
    </div>
  </div>

  <div
    v-if="hasNextPage"
    class="pt-5 lg:pt-10 flex justify-center"
  >
    <lfx-button
      size="large"
      class="!rounded-full"
      :loading="isFetchingNextPage"
      :disabled="isFetchingNextPage"
      @click="loadMore"
    >
      Load more
      <lfx-icon
        v-if="isFetchingNextPage"
        name="spinner-third"
        :size="16"
        class="animate-spin"
      />
    </lfx-button>
  </div>
  <div class="flex justify-center mt-5 lg:mt-10">
    <lfx-onboarding-link show-message />
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, watch, ref } from 'vue';
import { createError, showError } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import LfxCollectionProjectItem from '../components/details/collection-project-item.vue';
import LfxCollectionProjectItemLoading from '../components/details/collection-project-item-loading.vue';
import type { Collection, CollectionType } from '~~/types/collection';

import LfxCollectionHeader from '~/components/modules/collection/components/details/header.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useScroll from '~/components/shared/utils/scroll';
import { useQueryParam, type URLParams } from '~/components/shared/utils/query-param';
import {
  collectionDetailsParamsGetter,
  collectionListParamsSetter,
} from '~/components/modules/collection/services/collections.query.service';
import LfxOnboardingLink from '~/components/shared/components/onboarding-link.vue';
import { useBannerStore } from '~/components/shared/store/banner.store';
import type { Project } from '~~/types/project';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { TanstackKey } from '~/components/shared/types/tanstack';

const props = defineProps<{
  slug: string;
}>();

const { headerTopClass } = storeToRefs(useBannerStore());
const { user } = storeToRefs(useAuthStore());

const queryKey = computed(() => [TanstackKey.COLLECTION, props.slug]);

const {
  data: collection,
  isPending: loading,
  suspense,
  isError,
  error,
} = useQuery<Collection>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(props.slug),
  retry: false,
});

const currentCollection = ref<Collection | undefined>(collection.value);

watch(collection, (newCollection) => {
  currentCollection.value = newCollection;
});

const { scrollTop } = useScroll();
const collectionSlug = props.slug;

const { queryParams } = useQueryParam(collectionDetailsParamsGetter, collectionListParamsSetter);
const { onlyLFProjects, collectionSort } = queryParams.value;
const collectionType = computed<CollectionType>(() => {
  if (user.value && user.value.sub === currentCollection.value?.ssoUserId) {
    return 'my-collections';
  }

  return currentCollection.value?.ssoUserId ? 'community' : 'curated';
});

const sort = ref(collectionSort || 'contributorCount_desc');
const isLFOnly = ref(onlyLFProjects === 'true');

const pageSize = 60;

const params = computed(() => ({
  sort: sort.value,
  pageSize,
  isLF: isLFOnly.value,
  slug: collectionSlug,
}));

// const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess } =
//   PROJECT_API_SERVICE.fetchProjects(params);
const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess, refetch } =
  COLLECTIONS_API_SERVICE.fetchCollectionProjects(params);

// @ts-expect-error - TanStack Query type inference issue with Vue
const flatData = computed(() => data.value?.pages.flatMap((page: Pagination<Project>) => page.data) || []);

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage();
  }
};
const updateSort = (value: string) => {
  queryParams.value = {
    collectionSort: value,
    onlyLFProjects: queryParams.value.onlyLFProjects,
  };
};

const updateOnlyLFProjects = (value: boolean) => {
  queryParams.value = {
    collectionSort: queryParams.value.collectionSort,
    onlyLFProjects: value ? 'true' : undefined,
  };

  isLFOnly.value = value;
};

const handleCollectionUpdated = (collection: Collection) => {
  currentCollection.value = collection;
  refetch();
};

watch(
  () => queryParams.value,
  (value: URLParams) => {
    if (value.collectionSort && value.collectionSort !== sort.value) {
      sort.value = value.collectionSort;
    }

    if (value.onlyLFProjects) {
      const onlyLFParam = value.onlyLFProjects === 'true';
      if (onlyLFParam !== isLFOnly.value) {
        isLFOnly.value = onlyLFParam;
      }
    }
  },
);

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
  // await COLLECTIONS_API_SERVICE.prefetchCollectionProjects(params);
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView',
};
</script>
