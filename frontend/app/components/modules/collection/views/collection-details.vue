<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-maintain-height
    :scroll-top="scrollTop"
    :loaded="!isPending"
    :class="scrollTop > 0 ? 'fixed top-14 lg:top-17' : 'relative'"
    class="z-10 w-lvw ml-auto mr-0"
  >
    <div class="bg-white outline outline-neutral-100">
      <lfx-collection-header
        :loading="isPending"
        :collection="props.collection"
      />
      <lfx-collection-filters
        v-model:sort="sort"
        v-model:tab="tab"
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
      @click="loadMore"
    >
      Load more
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import {computed, onServerPrefetch} from 'vue'
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

const props = defineProps<{
  collection?: Collection
}>()

const {scrollTop} = useScroll();
const route = useRoute()
const collectionSlug = route.params.slug as string

const sort = ref('contributorCount_desc')
const tab = ref('all')
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
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView',
}
</script>
