<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-6 md:pt-10"
  >
    <lfx-table>

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
          v-for="project of data?.pages.flatMap(p => p.data)"
          :key="project.id"
          class="tr hover:!bg-neutral-100 transition cursor-pointer"
          @click="router.push({name: LfxRoutes.PROJECT, params: {slug: project.slug}})"
        >
          <td class="w-7/12 min-w-80">
            <div class="flex items-center gap-4">
              <lfx-avatar
                type="organization"
                size="large"
                class="min-w-12"
                :src="project.logo"
                :aria-label="project.logo && project.name"
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
        <template v-if="isFetching">
          <tr
            v-for="i in pageSize"
            :key="i"
          >
            <td class="w-7/12">
              <div class="flex items-center gap-4">
                <lfx-skeleton class="!w-12 !min-w-12 !h-12 rounded-sm" />
                <lfx-skeleton class="!h-6 !w-10/12" />
              </div>
            </td>
            <td>
              <lfx-skeleton class="!h-6 !w-25" />
            </td>
            <td>
              <lfx-skeleton class="!h-6 !w-25" />
            </td>
            <td>
              <lfx-skeleton class="!h-6 !w-25" />
            </td>
          </tr>
        </template>
        <tr v-if="hasNextPage">
          <td colspan="4">
            <div class="flex justify-center py-4 sm:py-8">
              <lfx-button
                size="large"
                class="!rounded-full"
                type="transparent"
                :loading="isFetchingNextPage"
                @click="loadMore"
              >
                Load more
              </lfx-button>
            </div>
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
import {useRouter} from "nuxt/app";
import {useInfiniteQuery, useQueryClient} from "@tanstack/vue-query";
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
import LfxButton from "~/components/uikit/button/button.vue";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";

const props = defineProps<{
  sort: string;
}>()

const router = useRouter()
const queryClient = useQueryClient();

const sort = computed(() => props.sort || 'totalContributors');

const sortMapping: Record<string, string> = {
  totalContributors: 'contributorCount_desc',
  softwareValue: 'softwareValue_desc',
  alphabetical: 'name_asc',
  healthScore: 'healthScore_desc',
}

const pageSize = 20

const queryKey = computed(() => [TanstackKey.OSS_INDEX_PROJECTS, sort.value])

const queryFn = PROJECT_API_SERVICE.fetchProjects(() => ({
  sort: sortMapping[sort.value] || 'contributorCount_desc',
  pageSize,
}))

const getNextPageParam = (lastPage) => {
  const nextPage = lastPage.page + 1
  const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
  return nextPage < totalPages ? nextPage : undefined
}

const {
  data,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  isFetching
} = useInfiniteQuery<Pagination<Project>>({
  queryKey,
  queryFn,
  getNextPageParam,
  initialPageParam: 0
})

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage()
  }
}

onServerPrefetch(async () => {
  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam: 0
  })
});
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListProjects'
};
</script>
