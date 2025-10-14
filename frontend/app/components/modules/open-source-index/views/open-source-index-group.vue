<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <LfxOSIHeader
    v-model:sort="sort"
    v-model:view="view"
    v-model:type="type"
  >
    <div class="flex items-center">
      <router-link
        :to="{
          name: LfxRoutes.OPENSOURCEINDEX,
          query: {
            sort,
            view: 'distribution',
            type: data?.type
          }
        }"
      >
        <lfx-icon-button
          icon="angle-left"
          type="transparent"
        />
      </router-link>
      <div
        v-if="data"
        class="pl-5"
      >
        <p class="text-xs text-neutral-500">
          {{ data?.type === 'horizontal' ? 'Stack' : 'Industry' }}
        </p>
        <h2 class="text-heading-3 font-bold font-secondary">
          {{ data?.name }}
        </h2>
      </div>
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
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import {LfxRoutes} from "~/components/shared/types/routes";

const route = useRoute();

const slug = ref<string>(route.params.slug as string || '');

const sort = ref<SortType>(route.query.sort as SortType || 'totalContributors');
const view = ref<string>(route.query.view as string || 'distribution');
const type = ref<OSIType>(route.query.type as OSIType || 'horizontal');

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
