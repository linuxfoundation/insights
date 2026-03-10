<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="sticky z-20"
    :class="headerTopClass.join(' ')"
  >
    <div
      :class="scrollTop > 50 ? 'border-b border-neutral-100' : ''"
      :style="headerBackgroundStyle"
    >
      <lfx-collection-list-header
        :type="props.type"
        :sort="sort"
        :view="view"
        @update:sort="updateSort"
        @update:view="updateView"
      />
    </div>
  </div>

  <section>
    <div class="container py-3 flex flex-col">
      <div
        v-if="flatData.length"
        :class="classDisplay"
      >
        <template v-if="view === 'list'">
          <lfx-collection-list-item
            v-for="collection in flatData"
            :key="collection.slug"
            :collection="collection"
          />
        </template>
        <template v-else>
          <lfx-collection-card
            v-for="collection in flatData"
            :key="collection.slug"
            :collection="collection"
          />
        </template>
      </div>

      <div
        v-if="isPending || isFetchingNextPage"
        :class="classDisplay"
      >
        <template v-if="view === 'list'">
          <lfx-collection-list-item-loading
            v-for="i in 3"
            :key="i"
          />
        </template>
        <template v-else>
          <lfx-collection-card-loading
            v-for="i in 3"
            :key="i"
          />
        </template>
      </div>

      <lfx-collections-empty v-if="flatData.length === 0 && isSuccess" />
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

  <!-- <lfx-button @click="isEditCollectionModalOpen = true">
    Edit Collection
  </lfx-button>
  <lfx-edit-collection-modal
    v-if="isEditCollectionModalOpen"
    v-model="isEditCollectionModalOpen"
    :collection="editCollection"
    @updated="updateCollection"
  /> -->
</template>

<script setup lang="ts">
import { watch, onServerPrefetch, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { collectionListParamsGetter, collectionListParamsSetter } from '../services/collections.query.service';
import { headerBackground } from '../config/collection-type-config';
import type { Pagination } from '~~/types/shared/pagination';

import LfxButton from '~/components/uikit/button/button.vue';
import LfxCollectionListItem from '~/components/shared/components/collection-list-item.vue';
import LfxCollectionListItemLoading from '~/components/modules/collection/components/list/collection-list-item-loading.vue';
import LfxCollectionListHeader from '~/components/modules/collection/components/list/header.vue';
import LfxCollectionCardLoading from '~/components/shared/components/collection-card-loading.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxCollectionsEmpty from '~/components/shared/components/collections-empty.vue';

import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import useScroll from '~/components/shared/utils/scroll';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useQueryParam, type URLParams } from '~/components/shared/utils/query-param';
import type { Collection, CollectionType } from '~~/types/collection';
import { useBannerStore } from '~/components/shared/store/banner.store';

// TODO: remove this, testing the edit modal
// import LfxEditCollectionModal from '~/components/modules/collection/components/edit-modal/edit-collection-modal.vue';

// const isEditCollectionModalOpen = ref(false);
// const editCollection = ref<Collection | null>({
//   id: '123',
//   name: 'Test Collection',
//   description: 'Test Description',
//   isPrivate: false,
//   featuredProjects: [],
//   updatedAt: (new Date()).toISOString(),
//   slug: 'test-collection',
//   type: 'community',
//   owner: {
//     name: 'Test User',
//     logo: 'https://via.placeholder.com/150',
//   },
//   isLf: false,
//   projectCount: 0,
// });

// const updateCollection = (collection: Collection) => {
//   editCollection.value = collection;
//   isEditCollectionModalOpen.value = false;
// };
// ------------------------------------------------------------

interface Props {
  type?: CollectionType;
}

const props = defineProps<Props>();

const { queryParams } = useQueryParam(collectionListParamsGetter, collectionListParamsSetter);
const { listSort } = queryParams.value;
const { showToast } = useToastService();
const { scrollTop } = useScroll();
const { headerTopClass } = storeToRefs(useBannerStore());
// NOTE: This is a temporary workaround to highlight the most important collections within the LF featured collections
const sort = ref(listSort || 'starred_desc');
const view = ref('grid');
const pageSize = computed(() => (view.value === 'grid' ? 99 : 100));

const params = computed(() => ({
  pageSize: pageSize.value,
  sort: sort.value || 'starred_desc',
  categories: undefined,
  type: props.type === 'my-collections' ? undefined : props.type,
}));

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess, error } =
  props.type === 'my-collections'
    ? COLLECTIONS_API_SERVICE.fetchMyCollections(params)
    : COLLECTIONS_API_SERVICE.fetchCollections(params);

const flatData = computed(() =>
  // @ts-expect-error - TanStack Query type inference issue with Vue
  COLLECTIONS_API_SERVICE.mapCollectionTypes(
    data.value?.pages.flatMap((page: Pagination<Collection>) => page.data) || [],
  ),
);

const classDisplay = computed(() => {
  if (view.value === 'grid') {
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-fr';
  }
  return 'flex flex-col';
});

const updateView = (value: string) => {
  view.value = value;
};

const headerBackgroundStyle = computed(() => headerBackground(props.type));

watch(error, (err: Error | null) => {
  if (err) {
    showToast('There was an error fetching collections', ToastTypesEnum.negative, undefined, 5000);
  }
});

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage();
  }
};

const updateSort = (value: string) => {
  queryParams.value = {
    listSort: value,
  };
};

// Server-side prefetching for infinite query
onServerPrefetch(async () => {
  // Prefetch the first page of the infinite query on the server
  await COLLECTIONS_API_SERVICE.prefetchCollections(params);
});

/**
 * Watch for query param changes on the first load only
 * This also avoids the issue of the category ID not existing in the allCategoryGroups array
 * When that happens, the category is set to 'all'
 */
watch(
  queryParams,
  (value: URLParams) => {
    if (value.listSort && value.listSort !== sort.value) {
      sort.value = value.listSort;
    }
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListView',
};
</script>
