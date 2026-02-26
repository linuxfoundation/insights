<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center gap-2 py-4 text-neutral-900 text-sm cursor-pointer hover:bg-neutral-50 transition-all duration-300 px-2 -mx-2"
    @click="navigateToProject(props.project.slug)"
  >
    <div class="flex items-center gap-3 w-2/5 font-semibold">
      <lfx-organization-logo
        :src="props.project.logo || ''"
        :is-lf="props.project.isLF"
        :alt="props.project.name"
      />
      <lfx-archived-tag
        v-if="props.project.status === 'archived'"
        :archived="true"
        label="Archived"
        type="project"
      />
      {{ props.project.name }}
    </div>
    <div class="w-1/5">
      {{ formatNumber(props.project.contributorCount) }}
    </div>
    <div class="w-1/5">
      {{ formatNumber(props.project.organizationCount) }}
    </div>
    <div class="w-1/5">${{ formatNumberShort(props.project.softwareValue || 0) }}</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Project } from '~~/types/project';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxArchivedTag from '~/components/shared/components/archived-tag.vue';
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  project: Project;
}>();

const router = useRouter();

const navigateToProject = (slug: string) => {
  router.push({ name: LfxRoutes.PROJECT, params: { slug } });
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionProjectItem',
};
</script>
