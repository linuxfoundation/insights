<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-maintain-height
    :scroll-top="scrollTop"
    :loaded="!loading"
    :class="scrollTop > 0 ? 'fixed top-14 lg:top-17' : 'relative'"
    class="z-10 w-lvw ml-auto mr-0"
  >
    <div class="bg-white outline outline-neutral-100">
      <lfx-collection-header
        :loading="loading"
        :collection="props.collection"
      />
      <lfx-collection-filters
        v-model:sort="sort"
        v-model:tab="tab"
        @update:sort="updateSort"
        @update:tab="updateTab"
      />
    </div>
  </lfx-maintain-height>

  <div class="container py-5 lg:py-10 flex flex-col gap-5 lg:gap-8">
    <div
      v-if="!isPending && data?.pages.flatMap(p => p.data).length"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8"
    >
      <lfx-project-list-item
        v-for="project in data?.pages.flatMap(p => p.data)"
        :key="project.slug"
        :project="project"
      />
    </div>

    <div
      v-if="data?.pages[0]?.data.length === 0 && isSuccess"
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
    class="py-5 lg:py-10 flex justify-center"
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
  <div class="flex justify-center">
    <lfx-onboarding-link
      show-message
    />
  </div>
</template>

<script setup lang="ts">
import {computed, onServerPrefetch, watch} from 'vue'
import { useRoute } from 'vue-router'
import { useInfiniteQuery } from '@tanstack/vue-query'
import type { Project } from '~~/types/project'
import type { Collection } from '~~/types/collection'
import type { Pagination } from '~~/types/shared/pagination'

import LfxCollectionHeader from '~/components/modules/collection/components/details/header.vue'
import LfxCollectionFilters from '~/components/modules/collection/components/details/filters.vue'
import LfxProjectListItem from '~/components/modules/project/components/list/project-list-item.vue'
import LfxProjectListItemLoading from '~/components/modules/project/components/list/project-list-item-loading.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue'
import {TanstackKey} from "~/components/shared/types/tanstack";
import {PROJECT_API_SERVICE} from "~/components/modules/project/services/project.api.service";
import useScroll from "~/components/shared/utils/scroll";
import { useQueryParam } from '~/components/shared/utils/query-param';
import {
  collectionDetailsParamsGetter,
  collectionListParamsSetter
}
from '~/components/modules/collection/services/collections.query.service';
import LfxOnboardingLink from '~/components/shared/components/onboarding-link.vue';

const props = defineProps<{
  collection?: Collection,
  loading?: boolean
}>()

const {scrollTop} = useScroll();
const route = useRoute()
const collectionSlug = route.params.slug as string

const { queryParams } = useQueryParam(collectionDetailsParamsGetter, collectionListParamsSetter);
const { collectionTab, collectionSort } = queryParams.value;

const sort = ref(collectionSort || 'contributorCount_desc')
const tab = ref(collectionTab || 'all')
const pageSize = 60

const isLF = computed(() => tab.value === 'lfx')

const queryKey = computed(() => [TanstackKey.PROJECTS, sort.value, tab.value, collectionSlug])

const {
  data,
  isPending,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  isSuccess,
    suspense,
} = useInfiniteQuery<Pagination<Project>>({
  queryKey,
  queryFn: PROJECT_API_SERVICE.fetchProjects(() => ({
    sort: sort.value,
    pageSize,
    isLF: isLF.value,
    collectionSlug,
  })),
  getNextPageParam: (lastPage) => {
    const nextPage = lastPage.page + 1
    const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
    return nextPage < totalPages ? nextPage : undefined
  },
})

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage()
  }
}

onServerPrefetch(async () => {
  await suspense()
})

const updateSort = (value: string) => {
  queryParams.value = {
    collectionSort: value,
    collectionTab: queryParams.value.collectionTab,
  }
}

const updateTab = (value: string) => {
  queryParams.value = {
    collectionSort: queryParams.value.collectionSort,
    collectionTab: value,
  }
}

watch(() => queryParams.value, (value) => {
  if (value.collectionSort && value.collectionSort !== sort.value) {
    sort.value = value.collectionSort;
  }

  if (value.collectionTab && value.collectionTab !== tab.value) {
    tab.value = value.collectionTab;
  }
});

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView',
}
</script>
