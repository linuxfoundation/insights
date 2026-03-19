<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center gap-2 py-4 text-neutral-900 text-sm cursor-pointer hover:bg-neutral-50 transition-all duration-300 px-2 -mx-2"
    @click="navigateToProject(props.project.slug)"
  >
    <div class="flex items-center gap-3 w-3/12 font-semibold">
      <lfx-organization-logo
        :src="props.project.logoUrl || ''"
        :is-lf="props.project.isLF"
        :alt="props.project.name"
      />
      {{ props.project.name }}
      <lfx-archived-tag
        v-if="status === 'archived'"
        :archived="true"
        label="Archived"
        type="project"
      />
    </div>
    <div class="w-2/12">
      <lfx-popover
        placement="top"
        trigger-event="hover"
        :allow-pass-through="true"
      >
        <lfx-health-score :score="project.healthScore" />
        <template #content>
          <lfx-health-score-details :project="props.project" />
        </template>
      </lfx-popover>
    </div>
    <div class="w-1/12">
      {{ formatNumber(props.project.contributorCount) }}
    </div>
    <div class="w-1/12">${{ formatNumberShort(props.project.softwareValue || 0) }}</div>
    <div class="w-3/12">
      <lfx-popover
        placement="top"
        trigger-event="hover"
        :allow-pass-through="true"
      >
        <lfx-dependency-column :project="props.project" />
        <template #content>
          <lfx-dependency-details :project="props.project" />
        </template>
      </lfx-popover>
    </div>
    <div class="w-2/12">
      <lfx-badge-details :project="props.project" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ProjectInsights } from '~~/types/project';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxHealthScore from '~/components/shared/components/health-score.vue';
import LfxHealthScoreDetails from '~/components/modules/collection/components/details/health-score-details.vue';
import LfxDependencyColumn from '~/components/modules/collection/components/details/dependency-column.vue';
import LfxDependencyDetails from '~/components/modules/collection/components/details/dependency-details.vue';
import LfxBadgeDetails from '~/components/modules/collection/components/details/badge-details.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';

const props = defineProps<{
  project: ProjectInsights;
}>();

const router = useRouter();

// TODO: waiting on the backend to provide this
const status = computed(() => {
  return 'active';
});

const navigateToProject = (slug: string) => {
  router.push({ name: LfxRoutes.PROJECT, params: { slug } });
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionProjectItem',
};
</script>
