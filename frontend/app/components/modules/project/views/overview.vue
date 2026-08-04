<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <div class="flex justify-between pt-5 md:pt-10 lg:gap-10 gap-5 flex-col md:flex-row">
      <div class="w-full md:w-3/4">
        <lfx-card
          class="pt-6 flex flex-col md:gap-10 gap-5"
          :class="{
            'pb-6': !(hasSelectedArchivedRepos && healthScoreV2Status !== 'pending'),
          }"
        >
          <lfx-project-trust-score-v2
            :health-score-v2="healthScoreV2Data?.healthScoreV2 ?? null"
            :health-label="healthScoreV2Data?.healthLabel ?? null"
            :status="healthScoreV2Status"
          />
          <lfx-repos-exclusion-footer
            v-if="hasSelectedArchivedRepos && healthScoreV2Status !== 'pending'"
            page-content="health-score"
          />
        </lfx-card>
      </div>
      <div class="min-w-50 max-md:w-full w-1/4">
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
import LfxProjectTrustScoreV2 from '~/components/modules/project/components/overview/trust-score-v2.vue';
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxReposExclusionFooter from '~/components/shared/components/repos-exclusion-footer.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const route = useRoute();
const { hasSelectedArchivedRepos } = storeToRefs(useProjectStore());

const params = computed(() => ({
  projectSlug: route.params.slug as string,
}));

const {
  data: healthScoreV2Data,
  status: healthScoreV2Status,
  suspense,
} = OVERVIEW_API_SERVICE.fetchHealthScoreV2(params);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOverviewView',
};
</script>
