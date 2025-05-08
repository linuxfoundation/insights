<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container !px-5 lg:!px-10">
    <div class="flex justify-between pt-5 md:pt-10 gap-10 flex-col md:flex-row">
      <div class="w-full md:w-3/4 pb-6 md:pb-10 flex flex-col gap-8">
        <div>
          <lfx-project-trust-score
            :trust-score-summary="data"
            :status="status"
            :error="error"
          />
        </div>
        <div>
          <lfx-project-score-tabs
            :trust-score-summary="data"
            :status="status"
            :error="error"
          />
        </div>
      </div>
      <div class="pr-5 min-w-50 xl:pr-10 max-md:w-full w-1/4">
        <lfx-project-about-section />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import LfxProjectAboutSection from '~/components/modules/project/components/overview/about-section.vue';
import LfxProjectScoreTabs from '~/components/modules/project/components/overview/score-tabs.vue';
import LfxProjectTrustScore from '~/components/modules/project/components/overview/trust-score.vue';
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';

const route = useRoute();
const { selectedRepository } = storeToRefs(useProjectStore())

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value
}));

const {
  data, status, error, suspense
} = OVERVIEW_API_SERVICE.fetchTrustScoreSummary(params);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOverviewView',
}
</script>
