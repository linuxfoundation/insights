<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <LfxOSIHeader
    v-model:type="type"
    v-model:sort="sort"
    v-model:view="view"
    :status="status"
    :is-root="isRoot"
  >
    <div>
      <h1 class="text-heading-1 font-bold pb-2 font-secondary">
        Open Source Index
      </h1>
      <p class="text-body-1 text-neutral-500">
        Curated list of the most critical open source projects powering our modern digital
        infrastructure, measured by contributor volume and software value
      </p>
    </div>
  </LfxOSIHeader>

  <!-- Distribution -->
  <div
    v-if="view === 'distribution'"
    class="container pt-10"
  >
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

  <!-- List View -->
  <div class="pt-10" />
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
const view = ref<string>(route.query.view as string || 'list');

const {
  data,
  status,
  error,
  suspense
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort);

const chartData = computed<TreeMapData[]>(() => {
  return OSS_INDEX_API_SERVICE.mapDataToTreeMapData(data.value || [], 'group', sort.value);
});

const breadcrumbData = computed<BreadcrumbData>(() => {

  return {
    type: 'horizontal'
  };
});



onServerPrefetch(async () => {
    await suspense();
});

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
watch(type, (newVal) => {
  if (newVal) {
    router.replace({
      ...route,
      query: {
        ...route.query,
        type: newVal
      }
    });
  }
});

const title = 'Open Source Index | LFX Insights'

const description =  `Curated list of the most critical open source projects powering our modern
digital infrastructure, measured by contributor volume and software value`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>

<script lang="ts">
export default {
  name: 'LfxOpenSourceIndex'
};
</script>
