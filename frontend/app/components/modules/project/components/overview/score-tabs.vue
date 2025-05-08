<template>
  <lfx-project-load-state
    :status="status"
    :error="error"
    error-message="Error fetching overview score data"
  >
    <div class="sm:block hidden">
      <lfx-project-score-tab-view
        :tabs="tabs"
        :trust-score-summary="props.trustScoreSummary"
        :model-value="selectedTab"
        :score-data="data"
        :status="scoreDataStatus"
        :error="scoreDataError"
        @update:model-value="selectedTab = $event"
      />
    </div>
    <div class="sm:hidden block">
      <lfx-project-score-accordion-view
        :tabs="tabs"
        :trust-score-summary="props.trustScoreSummary"
        :model-value="selectedTab"
        :score-data="data"
        :status="scoreDataStatus"
        :error="scoreDataError"
        @update:model-value="selectedTab = $event"
      />
    </div>
  </lfx-project-load-state>
</template>

<script setup lang="ts">
import {
 ref, onServerPrefetch, computed
} from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import LfxProjectScoreTabView from './score-details/score-tab-view.vue';
import LfxProjectScoreAccordionView from './score-details/score-accordion-view.vue';
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import type { Tab } from '~/components/uikit/tabs/types/tab.types';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
}>();

const route = useRoute();
const { selectedRepository } = storeToRefs(useProjectStore())

const tabs = ref<Tab[]>([
  { label: 'Contributors', value: 'contributors' },
  { label: 'Popularity', value: 'popularity' },
  { label: 'Development', value: 'development' },
  { label: 'Security & Best practices', value: 'security' }
]);
const selectedTab = ref(tabs.value[0]?.value || 'contributors');

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value,
  type: selectedTab.value
}));

const {
  data, status: scoreDataStatus, error: scoreDataError, suspense
} = OVERVIEW_API_SERVICE.fetchScoreData(params);

onServerPrefetch(async () => {
  await suspense();
});

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreTabs'
};
</script>
