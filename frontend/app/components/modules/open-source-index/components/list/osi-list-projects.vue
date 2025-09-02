<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-10"
  >
    <lfx-table v-if="data">

      <!-- Head -->
      <thead>
        <tr>
          <th>Project</th>
          <th>
            <div class="flex items-center gap-1.5">
              <lfx-icon
                name="people-group"
                :size="14"
              />
              Contributors
            </div>
          </th>
          <th>
            <div class="flex items-center gap-1.5">
              <lfx-icon
                name="dollar-circle"
                :size="14"
              />
              Software value
            </div>
          </th>
          <th>
            <div class="flex items-center gap-1.5">
              <lfx-icon
                name="heart"
                :size="14"
              />
              Health score
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="project of data?.data || []"
          :key="project.id"
          class="tr hover:!bg-neutral-100 transition cursor-pointer"
          @click="router.push({name: LfxRoutes.PROJECT, params: {slug: project.slug}})"
        >
          <td class="w-7/12">
            <div class="flex items-center gap-4">
              <lfx-avatar
                type="organization"
                size="large"
                class="min-w-12"
                :src="project.logo"
              />
              <div>
                <h6 class="text-sm font-semibold">
                  {{project.name}}
                </h6>
                <p
                  v-if="project.description"
                  class="text-xs text-neutral-500 mt-0.5 line-clamp-2"
                >
                  {{ project.description }}
                </p>
              </div>
            </div>
          </td>
          <td>
            <span v-if="project.contributorCount > 0">{{formatNumber(project.contributorCount)}}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="project.softwareValue">${{formatNumberShort(project.softwareValue)}}</span>
            <span v-else>-</span>
          </td>
          <td>
            <lfx-health-score
              v-if="project.healthScore > 0"
              :score="project.healthScore"
            />
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </lfx-table>
  </div>
</template>

<script setup lang="ts">
import {
  computed, onServerPrefetch
} from 'vue';
import {useQuery} from "@tanstack/vue-query";
import {useRouter} from "nuxt/app";
import LfxTable from "~/components/uikit/table/table.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import type {Pagination} from "~~/types/shared/pagination";
import type {Project} from "~~/types/project";
import {PROJECT_API_SERVICE} from "~/components/modules/project/services/project.api.service";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {formatNumber, formatNumberShort} from "~/components/shared/utils/formatter";
import LfxHealthScore from "~/components/shared/components/health-score.vue";
import {LfxRoutes} from "~/components/shared/types/routes";

const props = defineProps<{
  sort: string;
}>()

const router = useRouter()

const sort = computed(() => props.sort || 'totalContributors');

const sortMapping: Record<string, string> = {
  totalContributors: 'contributorCount_desc',
  softwareValue: 'softwareValue_desc',
  alphabetical: 'name_asc',
  healthScore: 'healthScore_desc',
}

const queryKey = computed(() => [TanstackKey.OSS_INDEX_PROJECTS, sort.value])

const {
  data,
  suspense,
} = useQuery<Pagination<Project>>({
  queryKey,
  queryFn: PROJECT_API_SERVICE.fetchProjects(() => ({
    sort: sortMapping[sort.value] || 'contributorCount_desc',
    pageSize: 20,
  })),
})


onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListProjects'
};
</script>
