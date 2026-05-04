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
        :type="collectionType"
        @update:only-lf-projects="updateOnlyLFProjects"
        @updated="handleCollectionUpdated"
      />
    </div>
  </lfx-maintain-height>

  <div class="container pb-5 lg:pb-10 flex flex-col">
    <template v-if="!isPending && flatData.length">
      <!-- Mobile: card list -->
      <div class="flex flex-col md:hidden">
        <lfx-collection-project-item
          v-for="project in flatData"
          :key="project.slug"
          :project="project"
          as="card"
        />
      </div>

      <!-- Desktop: scrollable table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[60rem] border-collapse">
          <thead class="text-neutral-500 text-xs font-semibold">
            <tr>
              <th
                class="w-3/12 py-5 px-2 text-left whitespace-nowrap cursor-pointer group"
                @click="handleSort('name')"
              >
                <span class="inline-flex items-center gap-1">
                  Project
                  <lfx-icon
                    name="caret-large-down"
                    type="solid"
                    :class="[sortIconClass('name')]"
                  />
                </span>
              </th>
              <th class="w-2/12 py-5 px-2 text-left whitespace-nowrap font-semibold">Health Score</th>
              <th
                class="w-1/12 py-5 px-2 text-left whitespace-nowrap cursor-pointer group"
                @click="handleSort('contributorCount')"
              >
                <span class="inline-flex items-center gap-1">
                  Contributors
                  <lfx-icon
                    name="caret-large-down"
                    type="solid"
                    :class="[sortIconClass('contributorCount')]"
                  />
                </span>
              </th>
              <th class="w-1/12 py-5 px-2 text-left whitespace-nowrap font-semibold">Software value</th>
              <th class="w-3/12 py-5 px-2 text-left whitespace-nowrap font-semibold">
                Contributor/Organization dependency
              </th>
              <th class="w-2/12 py-5 px-2 text-left whitespace-nowrap font-semibold">Achievements</th>
            </tr>
          </thead>
          <tbody>
            <lfx-collection-project-item
              v-for="project in flatData"
              :key="project.slug"
              :project="project"
              as="row"
            />
          </tbody>
        </table>
      </div>
    </template>

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

  <!-- Mobile floating bar: sort + LF filter -->
  <teleport to="body">
    <div
      v-if="isMobile"
      class="fixed bottom-4 z-50 left-1/2 transform -translate-x-1/2 bg-white border border-neutral-200 rounded-full shadow-md px-1 py-px flex items-center gap-1"
    >
      <lfx-dropdown-select
        :model-value="sort"
        width="14rem"
        placement="top-start"
        @update:model-value="updateSort"
      >
        <template #trigger="{ selectedOption }">
          <div class="flex items-center py-1.5 px-3 gap-1.5 cursor-pointer">
            <lfx-icon
              name="arrow-down-wide-short"
              :size="14"
            />
            <p class="text-xs whitespace-nowrap">{{ selectedOption?.label || 'Sort' }}</p>
          </div>
        </template>
        <lfx-dropdown-item
          value="contributorCount_desc"
          label="Most contributors"
        />
        <lfx-dropdown-item
          value="name_asc"
          label="Alphabetically"
        />
      </lfx-dropdown-select>
      <div class="border-l border-neutral-200 my-1"></div>
      <lfx-dropdown-select
        :model-value="isLFOnly ? 'lfx' : 'all'"
        width="12rem"
        placement="top-end"
        @update:model-value="(v) => updateOnlyLFProjects(v === 'lfx')"
      >
        <template #trigger="{ selectedOption }">
          <div class="flex items-center py-1.5 px-3 gap-1.5 cursor-pointer">
            <lfx-icon
              name="globe"
              :size="14"
            />
            <p class="text-xs whitespace-nowrap">{{ selectedOption?.label || 'All projects' }}</p>
          </div>
        </template>
        <lfx-dropdown-item
          value="all"
          label="All projects"
        />
        <lfx-dropdown-item
          value="lfx"
          label="Only LF projects"
        />
      </lfx-dropdown-select>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, watch, ref } from 'vue';
import { createError, showError, useRequestFetch } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import LfxCollectionProjectItem from '../components/details/collection-project-item.vue';
import LfxCollectionProjectItemLoading from '../components/details/collection-project-item-loading.vue';
import type { Collection, CollectionType } from '~~/types/collection';

import LfxCollectionHeader from '~/components/modules/collection/components/details/header.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useScroll from '~/components/shared/utils/scroll';
import useResponsive from '~/components/shared/utils/responsive';
import { useQueryParam, type URLParams } from '~/components/shared/utils/query-param';
import {
  collectionDetailsParamsGetter,
  collectionListParamsSetter,
} from '~/components/modules/collection/services/collections.query.service';
import LfxOnboardingLink from '~/components/shared/components/onboarding-link.vue';
import { useBannerStore } from '~/components/shared/store/banner.store';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { useLikeCounts } from '~/components/modules/collection/composables/useLikeCounts';
import { CollectionTypeEnum } from '~/components/modules/collection/config/collection-type-config';

const props = defineProps<{
  slug: string;
}>();

const { headerTopClass } = storeToRefs(useBannerStore());
const { user } = storeToRefs(useAuthStore());
const requestFetch = useRequestFetch();

const queryKey = computed(() => [TanstackKey.COLLECTION, props.slug]);

const {
  data: collection,
  isPending: loading,
  suspense,
  isError,
  error,
} = useQuery<Collection>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(props.slug, requestFetch),
  retry: false,
});

const currentCollection = ref<Collection | undefined>(collection.value);

watch(collection, (newCollection) => {
  currentCollection.value = newCollection;
});

const detailCollectionIds = computed(() => (currentCollection.value ? [currentCollection.value.id] : []));
useLikeCounts(detailCollectionIds);

const { scrollTop } = useScroll();
const { pageWidth } = useResponsive();
const isMobile = computed(() => pageWidth.value > 0 && pageWidth.value < 768);
const collectionSlug = props.slug;

const { queryParams } = useQueryParam(collectionDetailsParamsGetter, collectionListParamsSetter);
const { onlyLFProjects, collectionSort } = queryParams.value;
const collectionType = computed<CollectionType>(() => {
  if (user.value && user.value.sub === currentCollection.value?.ssoUserId) {
    return CollectionTypeEnum.MY_COLLECTIONS;
  }

  return currentCollection.value?.ssoUserId ? CollectionTypeEnum.COMMUNITY : CollectionTypeEnum.CURATED;
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
  COLLECTIONS_API_SERVICE.fetchCollectionProjects(params, requestFetch);

// @ts-expect-error - TanStack Query type inference issue with Vue
const flatData = computed(() => data.value?.pages.flatMap((page: Pagination<ProjectInsights>) => page.data) || []);

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

const currentSort = computed(() => {
  const match = sort.value.match(/^(.+)_(asc|desc)$/);
  if (match) {
    return { field: match[1], direction: match[2] as 'asc' | 'desc' };
  }
  return { field: sort.value, direction: 'asc' as const };
});

const handleSort = (field: string) => {
  const defaultDirections: Record<string, 'asc' | 'desc'> = {
    name: 'asc',
    contributorCount: 'desc',
    organizationCount: 'desc',
  };

  if (currentSort.value.field === field) {
    const newDirection = currentSort.value.direction === 'asc' ? 'desc' : 'asc';
    updateSort(`${field}_${newDirection}`);
  } else {
    const direction = defaultDirections[field] || 'asc';
    updateSort(`${field}_${direction}`);
  }
};

const sortIconClass = (field: string) => {
  const isActive = currentSort.value.field === field;
  const isAscending = currentSort.value.direction === 'asc';

  return [
    isActive ? 'text-neutral-500' : 'text-neutral-300 invisible group-hover:visible',
    isActive && isAscending ? 'rotate-180' : '',
  ];
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
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView',
};
</script>
