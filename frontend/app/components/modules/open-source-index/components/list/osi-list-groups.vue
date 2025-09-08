<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-6 md:pt-10"
  >
    <lfx-accordion
      v-model="groups"
      class="flex flex-col gap-5"
    >
      <lfx-accordion-item
        v-for="group of data"
        :key="group.id"
        :reverse="true"
        :name="group.id"
        class="bg-white px-6 hover:bg-neutral-50 shadow-sm rounded-lg"
        :class="group.id === groups ? '!bg-white' : ''"
      >
        <div class="flex flex-col md:flex-row justify-between py-4">
          <p class="font-secondary font-bold text-heading-3">
            {{group.name}}
          </p>
          <div class="flex items-center gap-4">
            <article class="flex items-center gap-1.5">
              <div class="h-5 w-5 rounded-full flex items-center justify-center bg-brand-50">
                <lfx-icon
                  name="people-group"
                  :size="10"
                  class="text-brand-600"
                />
              </div>
              <p class="text-xs whitespace-nowrap">
                {{formatNumber(group.totalContributors)}}
                {{ pluralize('contributors', group.totalContributors) }}
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
              <p class="text-xs whitespace-nowrap">${{ formatNumberShort(group.softwareValue) }}</p>
            </article>
          </div>
        </div>

        <template #content>
          <div class="-ml-14 rounded-xl">
            <lfx-osi-list-collections
              :sort="props.sort"
              :category-group-id="group.id"
              class="!pt-0 !px-0 !pb-0"
              :hide-pagination="true"
              :page-size="5"
              :is-sub="true"
            />
          </div>
        </template>
      </lfx-accordion-item>
      <template v-if="isFetching">
        <lfx-skeleton
          v-for="i in 10"
          :key="i"
          class="!w-full !h-16 rounded-lg"
        />
      </template>
    </lfx-accordion>
  </div>
</template>

<script setup lang="ts">
import {computed, onServerPrefetch} from "vue";
import pluralize from "pluralize";
import {OSS_INDEX_API_SERVICE} from "~/components/modules/open-source-index/services/osi.api.service";
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";
import {formatNumber, formatNumberShort} from "~/components/shared/utils/formatter";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxOsiListCollections from "~/components/modules/open-source-index/components/list/osi-list-collections.vue";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";

const props = defineProps<{
  type: string;
  sort: string;
}>()

const type = computed(() => props.type || 'horizontal');
const sort = computed(() => props.sort || 'totalContributors');

const groups = ref('');

const {
  data,
    isFetching,
  suspense
} = OSS_INDEX_API_SERVICE.fetchOSSGroup(type, sort);


onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListGroups'
};
</script>
