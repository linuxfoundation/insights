<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="bg-white bg-[url('~/assets/images/collections-header.png')] bg-contain bg-no-repeat bg-right">
    <div class="container py-5 md:py-8">
      <lfx-tag
        type="transparent"
        :size="pageWidth < 768 ? 'small' : 'medium'"
      >
        <lfx-icon
          name="rectangle-history"
          :size="14"
        />
        Collections
      </lfx-tag>
      <div class="w-full max-w-120">
        <h1 class="text-heading-2 lg:text-heading-1 mt-4 md:mt-5 font-secondary font-bold">
          Discover the world's most critical open source projects
        </h1>
      </div>
    </div>
  </section>

  <div class="sticky top-28 sm:top-21 lg:top-24 z-20">
    <div class="bg-white border-b border-neutral-100">
      <div
        class="container transition-all"
        :class="scrollTop > 50 ? 'py-3 md:py-4' : 'py-3 md:py-5'"
      >
        <div class="flex items-center justify-between gap-4 w-full">
          <lfx-collection-list-filters
            v-model:category="category"
            :category-groups-vertical="categoryGroupsVertical"
            :category-groups-horizontal="categoryGroupsHorizontal"
            @update:category="updateCategory"
          />
          <lfx-dropdown-select
            v-model="sort"
            width="20rem"
            placement="bottom-end"
            @update:model-value="updateSort"
          >
            <template #trigger="{ selectedOption }">
              <lfx-dropdown-selector>
                <lfx-icon
                  name="arrow-down-wide-short"
                  :size="16"
                />
                <span class="hidden sm:inline">{{ selectedOption.label }}</span>
              </lfx-dropdown-selector>
            </template>

            <lfx-dropdown-item
              value="starred_desc"
              label="Featured"
            />
            <lfx-dropdown-item
              value="projectCount_desc"
              label="Most projects"
            />
            <lfx-dropdown-item
              value="name_asc"
              label="Alphabetically"
            />

          </lfx-dropdown-select>
        </div>
      </div>
    </div>
  </div>

  <section>
    <div class="container py-5 lg:py-10 flex flex-col gap-5 lg:gap-8">
      <div
        v-if="isPending"
        class="flex flex-col gap-5 lg:gap-8"
      >
        <lfx-collection-list-item-loading
          v-for="i in 3"
          :key="i"
        />
      </div>

      <div
        v-else
        class="flex flex-col gap-5 lg:gap-8"
      >
        <lfx-collection-list-item
          v-for="collection in data?.pages.flatMap(p => p.data)"
          :key="collection.slug"
          :collection="collection"
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
          No collections found
        </h3>
        <p class="text-body-1 text-neutral-500 pt-3 text-center">
          Try adjusting your filters to find what you’re looking for.
        </p>
      </div>
    </div>
  </section>

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
import {
 watch, onServerPrefetch, computed, ref
} from 'vue'
import {useInfiniteQuery, useQuery} from '@tanstack/vue-query'
import { collectionListParamsGetter, collectionListParamsSetter } from
  "../services/collections.query.service";
import type { Pagination } from '~~/types/shared/pagination'
import type { Collection } from '~~/types/collection'

import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxTag from '~/components/uikit/tag/tag.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue'
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue'
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue'
import LfxCollectionListItem from '~/components/modules/collection/components/list/collection-list-item.vue'
import LfxCollectionListFilters from '~/components/modules/collection/components/list/collection-list-filters.vue'
import LfxCollectionListItemLoading from
  '~/components/modules/collection/components/list/collection-list-item-loading.vue'

import useToastService from '~/components/uikit/toast/toast.service'
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types'
import useResponsive from '~/components/shared/utils/responsive'
import useScroll from '~/components/shared/utils/scroll'
import {TanstackKey} from "~/components/shared/types/tanstack";
import {COLLECTIONS_API_SERVICE} from "~/components/modules/collection/services/collections.api.service";
import { useQueryParam } from '~/components/shared/utils/query-param';
import type { CategoryGroup } from '~~/types/category'

const { queryParams } = useQueryParam(collectionListParamsGetter, collectionListParamsSetter);
const { listSort } = queryParams.value;
const { showToast } = useToastService();
const {pageWidth} = useResponsive();
const {scrollTop} = useScroll();

// NOTE: This is a temporary workaround to highlight the most important collections within the LF featured collections
const pageSize = 100
const sort = ref(listSort || 'starred_desc')
const category = ref('all');

const queryKey = computed(() => [TanstackKey.COLLECTIONS, sort.value, category.value])

const {
  data,
  isPending,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  isSuccess,
  error,
    suspense
} = useInfiniteQuery<Pagination<Collection>, Error>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollections(() => ({
    pageSize,
    sort: sort.value,
    categories: getCategoryIds(category.value),
  })),
  getNextPageParam: (lastPage) => {
    const nextPage = lastPage.page + 1
    const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
    return nextPage < totalPages ? nextPage : undefined
  },
})

/* Moving the options fetch here on the main component
The dropdown-select component for sub options sets the selected option label and value the same
If the dropdown's value is set other than the default value, the selected option label is
displayed as value.
*/
const queryKeyVertical = computed(() => [
  TanstackKey.CATEGORY_GROUPS,
  'vertical',
]);
const queryKeyHorizontal = computed(() => [
  TanstackKey.CATEGORY_GROUPS,
  'horizontal',
]);

const {
  data: dataVertical,
  suspense: suspenseVertical
} = useQuery<Pagination<CategoryGroup>>({
  queryKey: queryKeyVertical,
  queryFn: COLLECTIONS_API_SERVICE.fetchCategoryGroups(() => ({
    type: 'vertical',
    pageSize: 1000
  })),
});
const {
  data: dataHorizontal,
  suspense: suspenseHorizontal
} = useQuery<Pagination<CategoryGroup>>({
  queryKey: queryKeyHorizontal,
  queryFn: COLLECTIONS_API_SERVICE.fetchCategoryGroups(() => ({
    type: 'horizontal',
    pageSize: 1000
  })),
});

const categoryGroupsVertical = computed(() => (dataVertical.value?.data || []).map((cg) => ({
  ...cg,
  value: `group(${cg.id})-${cg.categories.map((c) => c.id).join(',')}`,
  categories: cg.categories
})))

const categoryGroupsHorizontal = computed(() => (dataHorizontal.value?.data || []).map((cg) => ({
  ...cg,
  value: `group(${cg.id})-${cg.categories.map((c) => c.id).join(',')}`,
  categories: cg.categories
})))

const allCategoryGroups = computed(() => [
  ...categoryGroupsVertical.value,
  ...categoryGroupsHorizontal.value,
  ...categoryGroupsVertical.value.flatMap((cg) => cg.categories.map((c) => ({id: c.id, name: c.name, value: c.id}))),
  ...categoryGroupsHorizontal.value.flatMap((cg) => cg.categories.map((c) => ({id: c.id, name: c.name, value: c.id})))
]);

watch(error, (err) => {
  if (err) {
    showToast('There was an error fetching collections', ToastTypesEnum.negative, undefined, 5000)
  }
})

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage()
  }
}

const updateCategory = (value: string) => {
  let catValue = value;
  if (value.startsWith('group(')) {
    const match = value.match(/group\(([^)]+)\)/)
    if (match) {
      catValue = `group(${match[1]?.toString() || ''})`
    }
  }

  queryParams.value = {
    listSort: queryParams.value.listSort,
    listCategory: catValue,
  }
}

const updateSort = (value: string) => {
  queryParams.value = {
    listSort: value,
    listCategory: queryParams.value.listCategory,
  }
}

const getCategoryIds = (value: string): string[] | undefined => {
  if (value === 'all') {
    return undefined
  }

  return value.replace(/group\(([^)]+)\)-/, '').split(',')
}

onServerPrefetch(async () => {
  await suspense();
  await suspenseVertical();
  await suspenseHorizontal();
})

/**
 * Watch for query param changes on the first load only
 * This also avoids the issue of the category ID not existing in the allCategoryGroups array
 * When that happens, the category is set to 'all'
 */
watch(queryParams, (value) => {
  if (value.listCategory && value.listCategory !== 'all') {
    let catId = value.listCategory;

    if (value.listCategory.startsWith('group(')) {
      const match = value.listCategory.match(/group\(([^)]+)\)/)
      if (match) {
        catId = match[1]?.toString() || '';
      }
    }

    const foundGroup = allCategoryGroups.value.find((group) => group.id === catId)
    category.value = foundGroup ? foundGroup.value : 'all';
  } else {
    category.value = 'all';
  }

  if (value.listSort && value.listSort !== sort.value) {
    sort.value = value.listSort;
  }
}, { immediate: true })
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListView'
};
</script>
