<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <LfxOSIHeader
    :type="type"
    :sort="sort"
    :status="status"
    :breadcrumb-data="breadcrumbData"
    :is-root="isRoot"
    @update:type="type = $event as OSIType"
    @update:sort="sort = $event as SortType"
  />

  <div class="container pt-8">
    <div class="lg:block hidden">
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching OSS Index data"
      >
        <LfxOSIChart
          :data="chartData"
          :sort="sort"
          :is-collection="!!props.category"
        />
      </lfx-project-load-state>
    </div>
    <div class="lg:hidden flex flex-col mx-auto py-20 justify-center items-center">
      <lfx-icon
        name="arrows-left-right-to-line"
        :size="80"
        class="text-neutral-300"
      />
      <div class="font-semibold text-sm text-neutral-500 mb-3">
        Open Source Index requires a bit more room
      </div>
      <div class="text-xs text-neutral-500">
        Please resize your browser window to explore this feature
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
 ref, computed, onServerPrefetch, watch
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LfxOSIHeader from '../components/osi-header.vue';
import { OSS_INDEX_API_SERVICE } from '../services/osi.api.service';
import LfxOSIChart from '../components/osi-chart.vue';
import type { BreadcrumbData, OSIType, SortType } from '../services/osi.api.service';
import type { TreeMapData } from '~/components/uikit/chart/types/ChartTypes';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import LfxIcon from '~~/app/components/uikit/icon/icon.vue';

const props = defineProps<{
  group?: string;
  category?: string;
  isRoot?: boolean;
}>();

const route = useRoute();
const router = useRouter();

const type = ref<OSIType>(route.query.type as OSIType || 'horizontal');
const sort = ref<SortType>(route.query.sort as SortType || 'totalContributors');

const {
  data: groupData,
  status: groupStatus,
  error: groupError,
  suspense: groupSuspense
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort, !props.group && !props.category);
const {
  data: categoryData,
  status: categoryStatus,
  error: categoryError,
  suspense: categorySuspense
} = OSS_INDEX_API_SERVICE.fetchOSSCategory(props.group, sort);
const {
  data: collectionData,
  status: collectionStatus,
  error: collectionError,
  suspense: collectionSuspense
} = OSS_INDEX_API_SERVICE.fetchOSSCollection(props.category, sort);

const chartData = computed<TreeMapData[]>(() => {
  if (props.group && categoryData.value) {
    return OSS_INDEX_API_SERVICE.mapCategoryDataToTreeMapData(categoryData.value, sort.value);
  }

  if (props.category && collectionData.value) {
    return OSS_INDEX_API_SERVICE.mapCollectionDataToTreeMapData(collectionData.value, sort.value);
  }

  return OSS_INDEX_API_SERVICE.mapDataToTreeMapData(groupData.value || [], 'group', sort.value);
});

const breadcrumbData = computed<BreadcrumbData>(() => {
  const isCategory = props.category && collectionData.value;
  const isGroup = props.group && categoryData.value;

  if (isCategory) {
    return {
      type: collectionData.value.categoryGroupType as OSIType,
      group: {
        name: collectionData.value.categoryGroupName,
        slug: collectionData.value.categoryGroupSlug
      },
      category: {
        name: collectionData.value.name,
        slug: collectionData.value.slug
      }
    };
  }

  if (isGroup) {
    return {
      type: categoryData.value.type as OSIType,
      group: {
        name: categoryData.value.name,
        slug: categoryData.value.slug
      }
    };
  }

  return {
    type: 'horizontal'
  };
});

const status = computed(() => {
  if (props.group) {
    return categoryStatus.value;
  }

  if (props.category) {
    return collectionStatus.value;
  }

  return groupStatus.value;
});

const error = computed(() => {
  if (props.group) {
    return categoryError.value;
  }

  if (props.category) {
    return collectionError.value;
  }

  return groupError.value;
});

onServerPrefetch(async () => {
  if (props.group && !props.category) {
    await categorySuspense();
  }

  if (props.category && !props.group) {
    await collectionSuspense();
  }

  if (!props.group && !props.category) {
    await groupSuspense();
  }
});

// watch(groupData, (newVal) => {
//   console.log(newVal);
// });
watch(sort, (newVal) => {
  if (newVal) {
    router.replace({
      ...route,
      query: {
        ...route.query,
        sort: newVal
      }
    });
  }
});

</script>

<script lang="ts">
export default {
  name: 'LfxOpenSourceIndex'
};
</script>
