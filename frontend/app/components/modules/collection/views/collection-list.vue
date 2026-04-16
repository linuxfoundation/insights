<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="sticky z-20"
    :class="headerTopClass.join(' ')"
  >
    <div :style="headerBackgroundStyle">
      <lfx-collection-list-header
        :type="props.type"
        :sort="sort"
        :view="view"
        :is-empty="isEmpty"
        :is-scrolled-state="isScrolledState"
        :is-loading="isPending || isFetchingNextPage"
        @update:sort="updateSort"
        @update:view="updateView"
        @created="refreshList"
      />
    </div>
  </div>

  <section>
    <div class="container pt-0 md:pt-6 pb-3 flex flex-col">
      <div
        v-if="flatData.length"
        :class="classDisplay"
      >
        <template v-if="effectiveView === 'list'">
          <lfx-collection-list-item
            v-for="collection in flatData"
            :key="collection.slug"
            :collection="collection"
            :variant="props.type"
            @updated="refreshList"
          />
        </template>
        <template v-else>
          <!-- Mobile + my-collections: dedicated mobile card -->
          <template v-if="isMobile && props.type === CollectionTypeEnum.MY_COLLECTIONS">
            <lfx-my-collection-card-mobile
              v-for="collection in flatData"
              :key="collection.slug"
              :collection="collection"
              @deleted="refreshList"
              @updated="refreshList"
            />
          </template>
          <template v-else>
            <lfx-collection-card
              v-for="collection in flatData"
              :key="collection.slug"
              :collection="collection"
              :variant="props.type"
              @deleted="refreshList"
              @updated="refreshList"
            />
          </template>
        </template>
      </div>

      <div
        v-if="isPending || isFetchingNextPage"
        :class="classDisplay"
        class="pt-6"
      >
        <template v-if="effectiveView === 'list'">
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

      <lfx-collections-empty
        v-if="flatData.length === 0 && isSuccess"
        @created="refreshList"
      />
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

  <section
    v-if="props.type === CollectionTypeEnum.MY_COLLECTIONS"
    class="container mt-10"
  >
    <lfx-liked-collections
      :view="effectiveView"
      :in-my-collections="true"
      @loaded="handleLikedCollectionsLoaded"
    />
  </section>

  <!-- Mobile floating sort bar -->
  <teleport to="body">
    <div
      v-if="isMobile && flatData.length > 0"
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
          value="starred_desc"
          label="Featured"
        />
        <lfx-dropdown-item
          value="likeCount_desc"
          label="Most liked"
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
  </teleport>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useQueryClient } from '@tanstack/vue-query';
import { collectionListParamsGetter, collectionListParamsSetter } from '../services/collections.query.service';
import { headerBackground } from '../config/collection-type-config';
import type { Pagination } from '~~/types/shared/pagination';

import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCollectionListItem from '~/components/shared/components/collection-list-item.vue';
import LfxCollectionListItemLoading from '~/components/modules/collection/components/list/collection-list-item-loading.vue';
import LfxCollectionListHeader from '~/components/modules/collection/components/list/header.vue';
import LfxCollectionCardLoading from '~/components/shared/components/collection-card-loading.vue';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxCollectionsEmpty from '~/components/shared/components/collections-empty.vue';
import LfxLikedCollections from '~/components/modules/collection/components/discovery/liked-collections.vue';
import LfxMyCollectionCardMobile from '~/components/modules/collection/components/my-collection-card-mobile.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import useScroll from '~/components/shared/utils/scroll';
import useResponsive from '~/components/shared/utils/responsive';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useQueryParam, type URLParams } from '~/components/shared/utils/query-param';
import type { Collection, CollectionType } from '~~/types/collection';
import { useBannerStore } from '~/components/shared/store/banner.store';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { type CollectionViewType } from '~/components/modules/collection/store/collections.store';
import { useLikeCounts } from '~/components/modules/collection/composables/useLikeCounts';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { CollectionTypeEnum } from '~/components/modules/collection/config/collection-type-config';

const queryClient = useQueryClient();

const props = defineProps<{
  type?: CollectionType;
}>();

const { queryParams } = useQueryParam(collectionListParamsGetter, collectionListParamsSetter);
const { listSort } = queryParams.value;
const { showToast } = useToastService();
const { scrollTop } = useScroll();
const { headerTopClass } = storeToRefs(useBannerStore());
const { user } = storeToRefs(useAuthStore());

const { pageWidth } = useResponsive();
const isMobile = computed(() => pageWidth.value > 0 && pageWidth.value < 768);

// NOTE: This is a temporary workaround to highlight the most important collections within the LF featured collections
const sort = ref(listSort || 'starred_desc');
const pageSize = computed(() => (view.value === 'grid' ? 99 : 100));
const view = ref<CollectionViewType>('grid');
const likedDataCount = ref(0);

const effectiveView = computed<CollectionViewType>(() => {
  if (!isMobile.value) return view.value;
  return 'grid';
});

const params = computed(() => ({
  pageSize: pageSize.value,
  sort: sort.value || 'starred_desc',
  categories: undefined,
  type: props.type === CollectionTypeEnum.MY_COLLECTIONS ? undefined : props.type,
}));

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess, error, refetch } =
  props.type === CollectionTypeEnum.MY_COLLECTIONS
    ? COLLECTIONS_API_SERVICE.fetchMyCollections(params, user)
    : COLLECTIONS_API_SERVICE.fetchCollections(params);

const flatData = computed(() =>
  COLLECTIONS_API_SERVICE.mapCollectionTypes(
    // @ts-expect-error - TanStack Query type inference issue with Vue
    data.value?.pages.flatMap((page: Pagination<Collection>) => page.data) || [],
  ),
);

const collectionIds = computed(() =>
  props.type !== CollectionTypeEnum.MY_COLLECTIONS ? flatData.value.map((c) => c.id) : [],
);
useLikeCounts(collectionIds);

const classDisplay = computed(() => {
  if (effectiveView.value === 'grid') {
    // my-collections on mobile uses dedicated mobile card with border-b — no extra gap
    if (isMobile.value && props.type === CollectionTypeEnum.MY_COLLECTIONS) {
      return 'flex flex-col';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-fr';
  }
  return 'flex flex-col';
});

const isScrolledState = computed(() => scrollTop.value < 10);

const updateView = (value: string) => {
  view.value = value as CollectionViewType;
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

const refreshList = () => {
  queryClient.invalidateQueries({ queryKey: [TanstackKey.MY_COLLECTIONS] });
  queryClient.invalidateQueries({ queryKey: [TanstackKey.COLLECTIONS] });
};

const isEmpty = computed(() => {
  if (props.type === 'my-collections') {
    return flatData.value.length === 0 && likedDataCount.value === 0;
  }

  return flatData.value.length === 0;
});

const handleLikedCollectionsLoaded = (count: number) => {
  likedDataCount.value = count;
};

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

watch(user, () => {
  refetch();
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListView',
};
</script>
