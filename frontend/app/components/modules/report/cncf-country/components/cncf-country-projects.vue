<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="overflow-x-auto">
    <lfx-table class="min-w-[560px]">
      <thead>
        <tr>
          <th>Project</th>
          <th class="w-2/5" />
          <th class="text-right">Contributors</th>
          <th class="text-right">Code contributions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="project in rows"
          :key="project.slug"
        >
          <td>
            <nuxt-link
              :to="{ name: LfxRoutes.PROJECT, params: { slug: project.slug } }"
              class="font-medium text-neutral-900 hover:underline"
            >
              {{ project.name }}
            </nuxt-link>
          </td>
          <td>
            <lfx-progress-bar
              :values="[project.share]"
              size="small"
              hide-empty
            />
          </td>
          <td class="text-right font-semibold">{{ formatNumber(project.contributorCount) }}</td>
          <td class="text-right text-neutral-600">{{ formatNumber(project.contributionCount) }}</td>
        </tr>
      </tbody>
    </lfx-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { LfxRoutes } from '~/components/shared/types/routes';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import LfxTable from '~/components/uikit/table/table.vue';
import type { CncfCountryProject } from '~~/types/report/cncf-country.types';

const props = defineProps<{
  projects: CncfCountryProject[];
}>();

const rows = computed(() => {
  const max = Math.max(1, ...props.projects.map((project) => project.contributorCount));
  return props.projects.map((project) => ({ ...project, share: (project.contributorCount / max) * 100 }));
});
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountryProjects',
};
</script>
