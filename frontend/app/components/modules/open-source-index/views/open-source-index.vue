<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <LfxOSIHeader
    v-model:type="type"
    v-model:sort="sort"
    v-model:view="view"
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
  <lfx-osi-distribution
    v-if="view === 'distribution'"
    :type="type"
    :sort="sort"
    :status="status"
    :has-error="!!error"
    :data="chartData"
  />
  <lfx-osi-list-projects
    v-else-if="type == 'projects'"
    :sort="sort"
  />
  <lfx-osi-list-collections
    v-else-if="type == 'collections'"
    :sort="sort"
  />
  <lfx-osi-list-groups
    v-else
    :sort="sort"
    :type="type"
  />
</template>

<script setup lang="ts">
import {
  computed, onServerPrefetch,
  ref,
} from 'vue';
import { useRoute } from 'vue-router';
import LfxOSIHeader from '../components/osi-header.vue';
import {type OSIType, OSS_INDEX_API_SERVICE, type SortType} from '../services/osi.api.service';
import LfxOsiDistribution from "~/components/modules/open-source-index/components/osi-distribution.vue";
import LfxOsiListProjects from "~/components/modules/open-source-index/components/list/osi-list-projects.vue";
import LfxOsiListCollections from "~/components/modules/open-source-index/components/list/osi-list-collections.vue";
import LfxOsiListGroups from "~/components/modules/open-source-index/components/list/osi-list-groups.vue";
import type {TreeMapData} from "~/components/uikit/chart/types/ChartTypes";

const route = useRoute();

const type = ref<OSIType>(route.query.type as OSIType || 'projects');
const sort = ref<SortType>(route.query.sort as SortType || 'healthScore');
const view = ref<string>(route.query.view as string || 'list');


const {
  data,
  status,
  error,
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort);

const chartData = computed<TreeMapData[]>(() => {
  return OSS_INDEX_API_SERVICE.mapDataToTreeMapData(data.value || [], 'group', sort.value);
});
</script>

<script lang="ts">
export default {
  name: 'LfxOpenSourceIndex'
};
</script>
