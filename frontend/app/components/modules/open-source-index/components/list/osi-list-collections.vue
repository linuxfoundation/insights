<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-6 md:pt-10"
  >
    <lfx-accordion
      v-model="accordion"
      class="shadow-sm rounded-lg overflow-hidden bg-white"
    >
      <lfx-accordion-item
        v-for="collection of data?.pages.flatMap(p => p.collections)"
        :key="collection.id"
        :reverse="true"
        :name="collection.id"
        class="bg-white pr-6 hover:bg-neutral-50 border-b border-neutral-100"
        :class="props.isSub ? 'pl-6 sm:pl-14' : 'pl-6'"
      >
        <div class="flex flex-col lg:flex-row justify-between py-4">
          <p class="text-base font-semibold">
            {{collection.name}}
          </p>
          <div class="flex items-center gap-4">
            <article class="flex items-center gap-1.5">
              <div class="h-5 w-5 rounded-full flex items-center justify-center bg-neutral-100">
                <lfx-icon
                  name="laptop-code"
                  :size="10"
                  class="text-neutral-500"
                />
              </div>
              <p class="text-xs whitespace-nowrap">{{ pluralize('project', collection.projectCount, true) }}</p>
            </article>
            <article class="flex items-center gap-1.5">
              <div class="h-5 w-5 rounded-full flex items-center justify-center bg-brand-50">
                <lfx-icon
                  name="people-group"
                  :size="10"
                  class="text-brand-600"
                />
              </div>
              <p class="text-xs whitespace-nowrap">
                {{formatNumber(collection.totalContributors)}}
                {{ pluralize('contributors', collection.totalContributors) }}
              </p>
            </article>
            <article class="flex items-center gap-1.5">
              <div class="h-5 w-5 rounded-full flex items-center justify-center bg-positive-50">
                <lfx-icon
                  name="dollar-circle"
                  :size="10"
                  class="text-positive-600"
                />
              </div>
              <p class="text-xs whitespace-nowrap">${{ formatNumberShort(collection.softwareValue) }}</p>
            </article>
          </div>
        </div>
        <template #content>
          <div
            class="border-t border-neutral-100 bg-white -mr-6"
            :class="props.isSub ? '-ml-14 sm:-ml-22' : '-ml-14'"
          >
            <lfx-table class="!shadow-none !rounded-none">
              <!-- Head -->
              <thead>
                <tr class="!bg-neutral-100">
                  <th class="!pl-6 sm:!pl-14">Project</th>
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
                  v-for="project of collection?.topProjects || []"
                  :key="project.id"
                  class="tr hover:!bg-neutral-100 transition cursor-pointer"
                  @click="router.push({name: LfxRoutes.PROJECT, params: {slug: project.slug}})"
                >
                  <td class="w-7/12 min-w-80 !pl-6 sm:!pl-14">
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
                    {{formatNumber(project.count)}}
                  </td>
                  <td>
                    ${{formatNumberShort(project.softwareValue)}}
                  </td>
                  <td>
                    <lfx-health-score :score="project.healthScore" />
                  </td>
                </tr>
              </tbody>
            </lfx-table>
          </div>
        </template>
      </lfx-accordion-item>
      <template v-if="isFetching">
        <div
          v-for="i in pageSize"
          :key="i"
          class="flex justify-between bg-white border-b border-neutral-100 p-6"
        >
          <lfx-skeleton class="!h-4 !w-4/12 rounded-sm" />
          <div class="flex items-center gap-4">

            <lfx-skeleton class="!h-4 !w-25 rounded-sm" />
            <lfx-skeleton class="!h-4 !w-25 rounded-sm" />
            <lfx-skeleton class="!h-4 !w-25 rounded-sm" />
          </div>
        </div>
      </template>
      <div
        v-if="hasNextPage && !props.hidePagination"
        class="py-8 flex justify-center"
      >
        <lfx-button
          size="large"
          type="transparent"
          class="!rounded-full"
          :loading="isFetchingNextPage"
          @click="loadMore"
        >
          Load more
        </lfx-button>
      </div>
    </lfx-accordion>
  </div>
</template>

<script setup lang="ts">
import {computed, onServerPrefetch} from "vue";
import pluralize from "pluralize";
import {useInfiniteQuery} from "@tanstack/vue-query";
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import {formatNumber, formatNumberShort} from "~/components/shared/utils/formatter";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxHealthScore from "~/components/shared/components/health-score.vue";
import LfxAvatar from "~/components/uikit/avatar/avatar.vue";
import LfxTable from "~/components/uikit/table/table.vue";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {OSS_INDEX_API_SERVICE} from "~/components/modules/open-source-index/services/osi.api.service";
import LfxButton from "~/components/uikit/button/button.vue";
import type {OSSIndexCategoryDetails} from "~~/types/ossindex/category";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";

const props = withDefaults(defineProps<{
  sort: string;
  categoryGroupId?: string;
  hidePagination?: boolean;
  pageSize?: number
  isSub?: boolean
}>(), {
  hidePagination: false,
  categoryGroupId: undefined,
  pageSize: 20,
  isSub: false,
})

const sort = computed(() => props.sort || 'totalContributors');

const accordion = ref<string>('');

const router = useRouter()

const queryKey = computed(() => [TanstackKey.OSS_INDEX_COLLECTIONS_LIST, sort.value, props.pageSize,
  props.categoryGroupId])

const {
  data,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  suspense,
    isFetching,
} = useInfiniteQuery<OSSIndexCategoryDetails>({
  queryKey,
  queryFn: OSS_INDEX_API_SERVICE.ossCollectionQueryFn(() => ({
    sort: sort.value || 'totalContributors',
    categoryGroupId: props.categoryGroupId,
    pageSize: props.pageSize,
  })),
  getNextPageParam: (lastPage) => {
    const nextPage = lastPage.page + 1
    return lastPage.collections.length >= props.pageSize ? nextPage : undefined
  },
})

const loadMore = () => {
  if (hasNextPage.value) {
    fetchNextPage()
  }
}

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListCollections'
};
</script>
