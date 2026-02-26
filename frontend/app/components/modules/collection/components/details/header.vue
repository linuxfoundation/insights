<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div :style="headerBackgroundStyle">
    <section
      class="container"
      :class="scrollTop > 50 ? 'py-3 md:py-5' : ' py-5'"
    >
      <div
        :class="scrollTop > 50 ? 'h-0 opacity-0' : 'h-10 sm:h-0 p-px sm:p-0 opacity-100'"
        class="transition-all overflow-hidden ease-linear"
      >
        <nuxt-link
          :to="{ name: collectionTab?.route }"
          class="block sm:hidden"
        >
          <lfx-button
            type="tertiary"
            size="small"
            icon="fa fa-angle-left fa-light"
            label="Collections"
            class="!rounded-full"
          />
        </nuxt-link>
      </div>
      <div class="flex items-center gap-1.5 transition-all mb-6">
        <div
          :class="
            scrollTop > 50 ? 'w-9 opacity-100 visible' : 'w-0 sm:w-9 opacity-0 sm:opacity-100 invisible sm:visible pr-0'
          "
          class="transition-all ease-linear"
        >
          <nuxt-link
            :to="{ name: collectionTab?.route }"
            class="ease-linear transition-all"
            :class="scrollTop > 50 ? 'block' : 'hidden sm:block'"
          >
            <lfx-icon-button
              type="transparent"
              icon="angle-left"
              class=""
            />
          </nuxt-link>
        </div>
        <div class="text-sm text-neutral-500 font-medium">
          {{ collectionTab?.detailsLabel }}
        </div>
      </div>
      <div class="flex justify-between gap-x-5 md:gap-x-15 flex-grow flex-col lg:flex-row items-start">
        <div class="flex-grow flex">
          <div class="w-full flex flex-col justify-center">
            <lfx-skeleton
              v-if="loading"
              height="2rem"
              width="25rem"
              class="rounded-sm"
            />
            <h1
              v-else-if="props.collection"
              class="font-secondary font-light transition-all"
              :class="scrollTop > 50 ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'"
            >
              {{ props.collection.name }}
            </h1>
            <div
              :class="scrollTop > 50 ? 'h-0 opacity-0 invisible pt-0' : 'h-auto opacity-100 visible'"
              class="w-full transition-all ease-linear"
            >
              <lfx-skeleton
                v-if="loading"
                height="1.25rem"
                width="100%"
                class="rounded-sm"
              />
              <p
                v-else-if="props.collection"
                class="text-body-2 md:text-body-1 text-neutral-500"
              >
                {{ props.collection.description }}
              </p>
            </div>
          </div>
        </div>
        <div
          v-if="props.collection && !loading"
          class="flex lg:justify-end transition-all ease-linear gap-4 w-full"
        >
          <!-- TODO: Add back the copy and heart buttons
          <lfx-icon-button
            icon="copy"
            class=""
          />
          <lfx-button
            type="outline"
            class="!rounded-full"
          >
            <lfx-icon name="heart" />
            1.6K
          </lfx-button> -->
          <lfx-button
            type="outline"
            class="!rounded-full"
          >
            <lfx-icon name="share-nodes" />
            Share
          </lfx-button>
        </div>
      </div>

      <div
        class="flex items-center gap-2 justify-between w-full"
        :class="scrollTop > 50 ? 'h-0 opacity-0 invisible pt-0' : 'h-auto opacity-100 visible mt-10'"
      >
        <div class="flex items-center gap-2">
          <img
            :src="owner.logo"
            :alt="owner.name"
            class="block"
            loading="lazy"
            width="16"
            height="16"
          />
          <p class="text-sm leading-5 text-neutral-600">
            by
            {{ owner.name }}
          </p>
          <span
            v-if="projectCount > 0"
            class="text-neutral-600"
            >・</span
          >
          <lfx-icon
            v-if="projectCount > 0"
            name="laptop-code"
            :size="16"
            class="text-neutral-600"
          />
          <p
            v-if="projectCount > 0"
            class="text-xs leading-5 text-neutral-600"
          >
            {{ projectCount }} projects
            <span v-if="props.collection?.updatedAt">
              ・ Updated {{ formatDate(props.collection.updatedAt, 'dd MMM yyyy') }}
            </span>
          </p>
        </div>
        <lfx-toggle v-model="isOnlyLFProjects"> Only Linux Foundation projects </lfx-toggle>
      </div>
    </section>
    <section class="container py-5 text-neutral-500 text-xs font-semibold">
      <div class="flex items-center gap-2">
        <div
          class="w-2/5 cursor-pointer group flex items-center gap-1"
          @click="handleSort('name_asc')"
        >
          Project
          <lfx-icon
            name="caret-large-down"
            type="solid"
            :class="[sortIconClass('name_asc')]"
          />
        </div>
        <!-- Health Score -->
        <div
          class="w-1/5 cursor-pointer group flex items-center gap-1"
          @click="handleSort('contributorCount_desc')"
        >
          Contributors
          <lfx-icon
            name="caret-large-down"
            type="solid"
            :class="[sortIconClass('contributorCount_desc')]"
          />
        </div>
        <!-- Temporary only until we have the other data ready -->
        <div
          class="w-1/5 cursor-pointer group flex items-center gap-1"
          @click="handleSort('organizationCount_desc')"
        >
          Organizations
          <lfx-icon
            name="caret-large-down"
            type="solid"
            :class="[sortIconClass('organizationCount_desc')]"
          />
        </div>
        <div class="w-1/5">Software value</div>
        <!-- Contributor/Organization dependency -->
        <!-- Achievements -->
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { collectionTabs, headerBackground } from '../../config/collection-type-config';
import type { Collection } from '~~/types/collection';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import useScroll from '~/components/shared/utils/scroll';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxButton from '~/components/uikit/button/button.vue';
// @ts-expect-error Vite asset import with ?url suffix
import lfIconUrl from '~/assets/images/icon.svg?url';
import { formatDate } from '~/components/shared/utils/formatter';
import LfxToggle from '~/components/uikit/toggle/toggle.vue';

const props = defineProps<{
  collection?: Collection;
  loading?: boolean;
  onlyLfProjects: boolean;
  sort: string;
}>();

const emit = defineEmits<{
  (e: 'update:onlyLfProjects', value: boolean): void;
  (e: 'update:sort', value: string): void;
}>();

const isOnlyLFProjects = computed({
  get: () => props.onlyLfProjects,
  set: (value: boolean) => {
    emit('update:onlyLfProjects', value);
  },
});

const { scrollTop } = useScroll();
const collectionTab = computed(
  () => collectionTabs.find((tab) => tab.type === props.collection?.type) || collectionTabs[0],
);
const headerBackgroundStyle = computed(() => headerBackground(props.collection?.type));

const projectCount = computed(() => props.collection?.projectCount || 0);

const owner = computed(() => {
  if (props.collection && props.collection.owner) {
    return {
      name: props.collection.owner?.name,
      logo: props.collection.owner?.logo,
    };
  }

  return {
    name: 'The Linux Foundation',
    logo: lfIconUrl,
  };
});

const handleSort = (value: string) => {
  emit('update:sort', value);
};

const sortIconClass = (value: string) => {
  return [props.sort === value ? 'text-neutral-500' : 'text-neutral-300 invisible group-hover:visible'];
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHeader',
};
</script>
