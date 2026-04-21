<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="p-6 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h2 class="font-secondary text-xl font-bold leading-7 text-neutral-900">Vulnerabilities</h2>
      <p class="text-xs leading-4 text-neutral-500">
        Overview of security vulnerabilities detected across project dependencies over the last 365 days.
      </p>
    </div>

    <!-- Aggregated view disclaimer - hidden when repos are selected -->
    <div
      v-if="showAggregatedDisclaimer"
      class="p-3 bg-neutral-50 border border-neutral-100 flex items-center gap-1.5 rounded-md"
    >
      <lfx-icon
        name="info-circle"
        :size="14"
        class="text-neutral-500"
      />
      <p class="text-xs leading-4 font-semibold text-neutral-500">
        You're viewing an aggregated snapshot of security vulnerabilities detected across all project dependencies over
        the last 365 days. For a detailed analysis,
        <span
          class="underline cursor-pointer"
          @click="emit('chooseRepository')"
          >choose a specific repository</span
        >.
      </p>
    </div>

    <!-- Data display -->
    <div class="flex flex-col gap-6">
      <!-- Summary stats row -->
      <lfx-project-vulnerability-summary :params="params" />

      <!-- Charts row -->
      <div class="flex gap-6">
        <lfx-project-vulnerability-severity :params="params" />
        <lfx-project-vulnerability-ecosystem :params="params" />
      </div>
    </div>

    <!-- Recent vulnerabilities table -->
    <lfx-project-recent-vulnerabilities
      :params="params"
      :show-view-more="true"
      @view-more="handleViewMore"
    />

    <!-- Vulnerability Drawer -->
    <lfx-project-vulnerability-drawer
      v-model="isDrawerOpen"
      :project-name="projectName"
      :project-logo="projectLogo"
    />
  </lfx-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import LfxProjectVulnerabilitySummary from './vulnerability-summary.vue';
import LfxProjectVulnerabilitySeverity from './vulnerability-severity.vue';
import LfxProjectVulnerabilityEcosystem from './vulnerability-ecosystem.vue';
import LfxProjectRecentVulnerabilities from './recent-vulnerabilities.vue';
import LfxProjectVulnerabilityDrawer from './vulnerability-drawer.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const route = useRoute();

const { selectedReposValues, project } = storeToRefs(useProjectStore());

const isRepository = computed(() => !!route.params.name || (project.value?.repositories?.length ?? 0) <= 1);
const hasSelectedRepos = computed(() => selectedReposValues.value && selectedReposValues.value.length > 0);
const showAggregatedDisclaimer = computed(() => !isRepository.value && !hasSelectedRepos.value);

const isDrawerOpen = ref(false);
const projectName = computed(() => project.value?.name || '');
const projectLogo = computed(() => project.value?.logo || '');

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  repos: selectedReposValues.value || undefined,
}));

const emit = defineEmits<{
  (e: 'chooseRepository'): void;
}>();

const handleViewMore = () => {
  isDrawerOpen.value = true;
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectVulnerabilitiesSection',
};
</script>
