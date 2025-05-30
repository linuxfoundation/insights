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
    @update:type="type = $event"
    @update:sort="sort = $event"
  />

  <div class="container pt-8">
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching OSS Index data"
    >
      <LfxOSIChart
        :data="chartData"
        :sort="sort"
      />
    </lfx-project-load-state>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onServerPrefetch } from 'vue';
import LfxOSIHeader from '../components/osi-header.vue';
import { OSS_INDEX_API_SERVICE } from '../services/osi.api.service';
import LfxOSIChart from '../components/osi-chart.vue';
import type { BreadcrumbData } from '../services/osi.api.service';
import type { TreeMapData } from '~/components/uikit/chart/types/ChartTypes';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';

const props = defineProps<{
  group?: string;
  category?: string;
}>();

const type = ref('horizontal');
const sort = ref('contributorCount');

const {
  data: groupData,
  status: groupStatus,
  error: groupError,
  suspense: groupSuspense
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, !props.group && !props.category);
const {
  data: categoryData,
  status: categoryStatus,
  error: categoryError,
  suspense: categorySuspense
} = OSS_INDEX_API_SERVICE.fetchOSSCategory(props.group);
const {
  data: collectionData,
  status: collectionStatus,
  error: collectionError,
  suspense: collectionSuspense
} = OSS_INDEX_API_SERVICE.fetchOSSCollection(props.category);

const chartData = computed<TreeMapData[]>(() => {
  if (props.group && categoryData.value) {
    return OSS_INDEX_API_SERVICE.mapCategoryDataToTreeMapData(categoryData.value);
  }

  if (props.category && collectionData.value) {
    return OSS_INDEX_API_SERVICE.mapCollectionDataToTreeMapData(collectionData.value);
  }

  return OSS_INDEX_API_SERVICE.mapDataToTreeMapData(groupData.value || [], 'group');
});

const breadcrumbData = computed<BreadcrumbData>(() => {
  const isCategory = props.category && collectionData.value;
  const isGroup = props.group && categoryData.value;

  if (isCategory) {
    return {
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
      group: {
        name: categoryData.value.name,
        slug: categoryData.value.slug
      }
    };
  }

  return {};
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

</script>

<script lang="ts">
export default {
  name: 'LfxOpenSourceIndex'
};
</script>
