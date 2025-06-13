<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section
    class="flex flex-col xl:flex-row w-full justify-between p-8 md:p-12
    bg-brand-50 rounded-xl xl:gap-0 gap-11"
  >
    <div class="max-w-auto xl:max-w-100 flex sm:flex-row flex-col xl:flex-col gap-4">
      <div class="flex flex-col gap-4">
        <h1 class="text-heading-2 lg:text-heading-1 font-secondary font-light">
          Linux Foundation <br>
          Open Source Index
        </h1>

        <p class="text-sm lg:text-base text-neutral-900 pb-4">
          Curated list of the most critical open source projects powering our modern digital
          infrastructure, measured by contributor volume and software value
        </p>
      </div>
      <div class="w-full xl:w-auto flex sm:justify-end xl:justify-start justify-center">
        <nuxt-link :to="{name: LfxRoutes.OPENSOURCEINDEX}">
          <lfx-button
            type="primary"
            size="large"
            class="!rounded-full text-nowrap"
          >
            Discover Open Source Index
          </lfx-button>
        </nuxt-link>
      </div>
    </div>
    <div class="basis-1/2 flex flex-col gap-8">
      <lfx-explore-source-index-filters
        :active-type="type"
        :active-sort="sort"
        @update:active-type="type = ($event as OSIType)"
        @update:active-sort="sort = ($event as SortType)"
      />
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching source index"
        :is-empty="isEmpty"
      >
        <lfx-explore-source-index-progress
          :data="ossData"
          :sort="sort"
          :type="type"
        />
      </lfx-project-load-state>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onServerPrefetch } from 'vue';
import LfxExploreSourceIndexFilters from './source-index-filters.vue';
import LfxExploreSourceIndexProgress from './source-index-progress.vue';
import {
  OSS_INDEX_API_SERVICE,
  type OSIType,
  type SortType
} from '~/components/modules/open-source-index/services/osi.api.service';
import LfxButton from '~/components/uikit/button/button.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

const type = ref<OSIType>('horizontal');
const sort = ref<SortType>('totalContributors');
const {
  data,
  status,
  error,
  suspense
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort, true);

const ossData = computed(() => data.value?.slice(0, 5));

const isEmpty = computed(() => isEmptyData(ossData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreSourceIndexSection'
};
</script>
