<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <LfxOSIHeader
    v-model:sort="sort"
  >
    <div>
      <h1 class="text-heading-1 font-bold pb-2 font-secondary">
        {{ data?.name }}
      </h1>
    </div>
  </LfxOSIHeader>

  <!-- Distribution -->
  <lfx-osi-distribution
    :sort="sort"
    :status="status"
    :has-error="!!error"
    :data="chartData"
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
import type {TreeMapData} from "~/components/uikit/chart/types/ChartTypes";

const route = useRoute();

const slug = ref<string>(route.params.slug as string || '');

const sort = ref<SortType>(route.query.sort as SortType || 'totalContributors');

const {
  data,
  status,
  error,
  suspense
} = OSS_INDEX_API_SERVICE.fetchOSSCategory(slug.value, sort);

const chartData = computed<TreeMapData[]>(() => {
  return OSS_INDEX_API_SERVICE.mapDataToTreeMapData(data.value?.categories || [], 'category', sort.value);
});

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxOpenSourceIndexGroup'
};
</script>
