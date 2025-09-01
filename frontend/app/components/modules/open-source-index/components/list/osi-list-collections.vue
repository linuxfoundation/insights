<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-10"
  >
    <lfx-accordion
      v-if="data"
      v-model="accordion"
    >
      <lfx-accordion-item
        v-for="collection of data?.collections"
        :key="collection.id"
        :reverse="true"
        :name="collection.id"
        class="bg-white px-6 py-4 hover:bg-neutral-50 border-b border-neutral-100"
      >
        <div class="flex justify-between">
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
              <p class="text-xs">{{ pluralize('project', collection.projectCount, true) }}</p>
            </article>
            <article class="flex items-center gap-1.5">
              <div class="h-5 w-5 rounded-full flex items-center justify-center bg-brand-50">
                <lfx-icon
                  name="people-group"
                  :size="10"
                  class="text-brand-600"
                />
              </div>
              <p class="text-xs">
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
              <p class="text-xs">${{ formatNumberShort(collection.softwareValue) }}</p>
            </article>
          </div>
        </div>
        <template #content>
          <div class="mt-4 border-t border-neutral-100 bg-white -mr-6 -mb-4 -ml-14">
            <lfx-table class="!shadow-none !rounded-none">
              <!-- Head -->
              <thead>
                <tr class="!bg-neutral-100">
                  <th class="!pl-14">Project</th>
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
                  <td class="w-7/12 !pl-14">
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
    </lfx-accordion>
  </div>
</template>

<script setup lang="ts">
import {computed, onServerPrefetch} from "vue";
import {useQuery} from "@tanstack/vue-query";
import pluralize from "pluralize";
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
import type {OSSIndexCategoryDetails} from "~~/types/ossindex/category";

const props = defineProps<{
  sort: string;
  categoryGroupId?: string;
}>()


const sort = computed(() => props.sort || 'totalContributors');

const accordion = ref<string>('');

const router = useRouter()

const queryKey = computed(() => [TanstackKey.OSS_INDEX_COLLECTIONS_LIST, sort.value])

const {
  data,
  suspense,
} = useQuery<OSSIndexCategoryDetails>({
  queryKey,
  queryFn: OSS_INDEX_API_SERVICE.ossCollectionQueryFn(() => ({
    sort: sort.value || 'totalContributors',
    categoryGroupId: props.categoryGroupId,
  })),
})


onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListCollections'
};
</script>
