<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container pt-10">
    <div class="lg:block hidden">
      <lfx-project-load-state
        :status="status"
        :error="props.hasError"
        error-message="Error fetching OSS Index data"
      >
        <LfxOSIChart
          :data="props.data"
          :sort="props.sort"
          :is-collection="false"
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
import LfxOSIChart from '../components/distribution/osi-chart.vue';
import type { TreeMapData } from '~/components/uikit/chart/types/ChartTypes';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import LfxIcon from '~~/app/components/uikit/icon/icon.vue';

const props = defineProps<{
  type?: string;
  sort: string;
  hasError?: boolean;
  status?: string;
  data: TreeMapData[];
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxOsiDistribution',
};
</script>
