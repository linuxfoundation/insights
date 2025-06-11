<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="flex flex-row w-full justify-between p-8 md:p-12 bg-brand-50 rounded-xl">
    <div class="max-w-100">
      text here
    </div>
    <div class="basis-1/2">
      progress bars here

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  OSS_INDEX_API_SERVICE,
  type OSIType,
  type SortType
} from '~/components/modules/open-source-index/services/osi.api.service';

const type = ref<OSIType>('horizontal');
const sort = ref<SortType>('totalContributors');
const {
  data,
  // status,
  // error,
  // suspense
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort, true);

// const ossData = computed(() => data.value?.slice(0, 5));
// const totalValue = computed(() => ossData.value?.reduce((acc, curr) => acc
//   + (sort.value === 'totalContributors' ? curr.totalContributors : curr.softwareValue), 0));

</script>

<script lang="ts">
export default {
  name: 'LfxExploreSourceIndexSection'
};
</script>
