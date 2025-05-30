<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- <lfx-maintain-height
    :scroll-top="scrollTop"
    :class="scrollTop > 0 ? 'fixed top-14 lg:top-17' : 'relative'"
    class="z-10 w-full"
    :loaded="pageWidth > 0"
  > -->
  <div class="bg-white outline outline-1 outline-neutral-200">
    <section class="container py-6">
      <div class="flex flex-col lg:flex-row items-end gap-4 lg:gap-16">
        <div class="flex flex-row gap-5 basis-2/3 items-end">
          <div
            v-if="!isRoot"
            class="pb-1"
          >
            <NuxtLink
              :to="backButtonLink"
              class="hover:text-brand-600"
            >
              <lfx-icon-button
                icon="chevron-left"
                class="text-neutral-900"
                type="transparent"
              />
            </NuxtLink>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <!-- breadcrumb -->
            <div
              v-if="!isRoot"
              class="text-sm text-neutral-500"
            >
              <NuxtLink
                :to="`/open-source-index`"
                class="hover:text-brand-600"
              >
                Open Source Index
              </NuxtLink>
              <span
                v-if="breadcrumbText"
                class="text-neutral-500"
              >・</span>
              <NuxtLink
                v-if="breadcrumbText"
                :to="`/open-source-index/group/${props.breadcrumbData.group?.slug}`"
                class="hover:text-brand-600"
              >
                {{ breadcrumbText }}
              </NuxtLink>
            </div>

            <lfx-skeleton-state
              :status="isRoot ? 'success' : status"
              height="2.5rem"
              width="30rem"
            >
              <h1
                class="font-bold mr-3 ease-linear transition-all font-secondary duration-200 text-heading-2"
              >
                {{ title }}
              </h1>
            </lfx-skeleton-state>
            <p
              v-if="isRoot"
              class="text-sm text-neutral-500"
            >
              Curated view of the most critical open source projects powering our modern digital infrastructure.
            </p>
          </div>
        </div>
        <div class="basis-1/3 flex items-center gap-5 justify-end">
          <div
            v-if="isRoot"
            class="border-r border-neutral-200 pr-5"
          >
            <lfx-dropdown-select
              v-model="type"
              width="20rem"
              placement="bottom-end"
              class="min-w-[215px]"
            >
              <template #trigger="{selectedOption}">
                <lfx-dropdown-selector>
                  <lfx-icon
                    name="chart-tree-map"
                    :size="16"
                  />
                  <span class="text-neutral-900 font-medium text-sm text-nowrap">
                    Grouped by:
                  </span>
                  <span class="inline font-normal text-sm text-nowrap">
                    {{selectedOption.label}}
                  </span>
                </lfx-dropdown-selector>
              </template>

              <lfx-dropdown-item
                value="horizontal"
                label="Stack"
              />
              <lfx-dropdown-item
                value="vertical"
                label="Industry"
              />
            </lfx-dropdown-select>
          </div>
          <div class="hidden">
            <lfx-tabs
              :tabs="sortTabs"
              :model-value="sort"
              @update:model-value="sort = $event"
            >
              <template #slotItem="{ option }">
                <div class="flex items-center gap-2">
                  <lfx-icon
                    :name="option.icon"
                    :size="14"
                  />
                  {{ option.label }}
                </div>
              </template>
            </lfx-tabs>
          </div>

          <lfx-icon-button
            icon="share-nodes"
            class=""
            @click="share()"
          />
        </div>
      </div>
    </section>
  </div>
  <!-- </lfx-maintain-height> -->

</template>

<script setup lang="ts">
import { computed } from 'vue';
// import useScroll from "~/components/shared/utils/scroll";
// import useResponsive from "~/components/shared/utils/responsive";
// import LfxMaintainHeight from "~/components/uikit/maintain-height/maintain-height.vue";
import type { AsyncDataRequestStatus } from 'nuxt/app';
import type { BreadcrumbData } from '../services/osi.api.service';
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxTabs from "~/components/uikit/tabs/tabs.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import {useShareStore} from "~/components/shared/modules/share/store/share.store";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";

const props = defineProps<{
  type: string;
  sort: string;
  breadcrumbData: BreadcrumbData;
  status: AsyncDataRequestStatus;
}>();

const emit = defineEmits<{(e: 'update:type' | 'update:sort', type: string): void
}>();

const sort = computed({
  get: () => props.sort,
  set: (value) => emit('update:sort', value)
});

const type = computed({
  get: () => props.type,
  set: (value) => emit('update:type', value)
});
const title = computed(() => {
  if (props.breadcrumbData.category) {
    return props.breadcrumbData.category.name;
  }
  if (props.breadcrumbData.group) {
    return props.breadcrumbData.group.name;
  }
  return `Open Source Index`;
});

const breadcrumbText = computed(() => {
  if (props.breadcrumbData.category && props.breadcrumbData.group) {
    return props.breadcrumbData.group.name;
  }
  return null;
});

const isRoot = computed(() => !props.breadcrumbData.category && !props.breadcrumbData.group);

const backButtonLink = computed(() => {
  if (props.breadcrumbData.category && props.breadcrumbData.group) {
    return `/open-source-index/group/${props.breadcrumbData.group?.slug}`;
  }
  return `/open-source-index`;
});

const sortTabs = [
  {
    label: 'Most Contributors',
    value: 'contributorCount',
    icon: 'people-group',
  },
  {
    label: 'Software Value',
    value: 'softwareValue',
    icon: 'circle-dollar',
  },
];
// const {scrollTop} = useScroll();
// const {pageWidth} = useResponsive();
const { openShareModal } = useShareStore();

const share = () => {
  const title = `Open Source Index | LFX Insights`;

  const url = new URL(window.location.href);
  url.hash = '';

  openShareModal({
    url: url.toString(),
    title
  })
};
</script>
<script lang="ts">
export default {
  name: 'LfxOSIHeader'
};
</script>
