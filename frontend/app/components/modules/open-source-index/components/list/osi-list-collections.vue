<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-10"
  >
    <lfx-accordion v-model="accordion">
      <lfx-accordion-item
        name="cncf"
        class="bg-white"
      >
        asdlkjl
      </lfx-accordion-item>
    </lfx-accordion>
  </div>
</template>

<script setup lang="ts">
import {
  computed
} from 'vue';
import LfxTable from "~/components/uikit/table/table.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
// import LfxOSIChart from '../components/distribution/osi-chart.vue';
// import type { TreeMapData } from '~/components/uikit/chart/types/ChartTypes';
// import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
// import LfxIcon from '~~/app/components/uikit/icon/icon.vue';

const props = defineProps<{
  sort: string;
}>()

const accordion = ref<string>('');

// const type = computed(() => props.type || 'projects');
// const sort = computed(() => props.sort || 'totalContributors');

// const {
//   data,
//   status,
//   error,
//   suspense
// } = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort);
//
// const chartData = computed<TreeMapData[]>(() => {
//   return OSS_INDEX_API_SERVICE.mapDataToTreeMapData(data.value || [], 'group', props.sort);
// });
//
// onServerPrefetch(async () => {
//     await suspense();
// });
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListCollections'
};
</script>
