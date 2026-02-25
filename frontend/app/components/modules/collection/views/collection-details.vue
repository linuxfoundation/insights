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
        :collection="props.collection!"
        :only-lf-projects="isLFOnly"
        @update:only-lf-projects="updateOnlyLFProjects"
      />
      <!-- <lfx-collection-filters
        v-model:sort="sort"
        v-model:tab="tab"
        @update:sort="updateSort"
        @update:tab="updateTab"
      /> -->
    </div>
  </lfx-maintain-height>

  <div class="container py-5 lg:py-10 flex flex-col gap-5 lg:gap-8">
    <div
      v-if="!isPending && flatData.length"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8"
    >
      <lfx-project-list-item
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
      v-if="isPending"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8"
    >
      <lfx-project-list-item-loading
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
  <div class="flex justify-center mt-5 mb-10 lg:mb-20 lg:mt-10">
    <lfx-onboarding-link show-message />
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Collection, CollectionType } from '~~/types/collection';

import LfxCollectionHeader from '~/components/modules/collection/components/details/header.vue';
import LfxProjectListItem from '~/components/modules/project/components/list/project-list-item.vue';
import LfxProjectListItemLoading from '~/components/modules/project/components/list/project-list-item-loading.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';
import { PROJECT_API_SERVICE } from '~/components/modules/project/services/project.api.service';
import useScroll from '~/components/shared/utils/scroll';
import { useQueryParam, type URLParams } from '~/components/shared/utils/query-param';
import {
  collectionDetailsParamsGetter,
  collectionListParamsSetter,
} from '~/components/modules/collection/services/collections.query.service';
import LfxOnboardingLink from '~/components/shared/components/onboarding-link.vue';
import { useBannerStore } from '~/components/shared/store/banner.store';

const props = defineProps<{
  type?: CollectionType;
  collection?: Collection;
  loading?: boolean;
}>();

const { headerTopClass } = storeToRefs(useBannerStore());

const { scrollTop } = useScroll();
const route = useRoute();
const collectionSlug = route.params.slug as string;

const { queryParams } = useQueryParam(collectionDetailsParamsGetter, collectionListParamsSetter);
const { onlyLFProjects, collectionSort } = queryParams.value;

const sort = ref(collectionSort || 'contributorCount_desc');
const isLFOnly = ref(onlyLFProjects === 'true');

const pageSize = 60;

const params = computed(() => ({
  sort: sort.value,
  pageSize,
  isLF: isLFOnly.value,
  collectionSlug,
}));

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess } =
  PROJECT_API_SERVICE.fetchProjects(params);

// @ts-expect-error - TanStack Query type inference issue with Vue
const flatData = computed(() => data.value?.pages.flatMap((page: Pagination<Project>) => page.data) || []);

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage();
  }
};
// const updateSort = (value: string) => {
//   queryParams.value = {
//     collectionSort: value,
//     onlyLFProjects: queryParams.value.onlyLFProjects,
//   };
// };

const updateOnlyLFProjects = (value: boolean) => {
  queryParams.value = {
    collectionSort: queryParams.value.collectionSort,
    onlyLFProjects: value ? 'true' : undefined,
  };
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
  await PROJECT_API_SERVICE.prefetchProjects(params);
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView',
};
</script>
