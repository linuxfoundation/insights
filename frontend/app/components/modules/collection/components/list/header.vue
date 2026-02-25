<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-10 container py-3 md:py-4">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <lfx-back class="ease-linear transition-all">
          <lfx-icon-button
            type="transparent"
            icon="angle-left"
            class=""
          />
        </lfx-back>

        <lfx-menu-button
          v-for="link of linkUrl"
          :key="link.label"
          :to="{ name: link.route }"
          :exact="true"
          class="!py-1"
          :class="[route.name === link.route ? link.activeClass : '']"
        >
          <template #default="{ isActive }">
            <div
              :class="[isActive ? link.iconHighlightClass : '']"
              class="rounded-full h-[26px] w-[26px] flex items-center justify-center"
            >
              <lfx-icon
                :name="link.icon!"
                :class="[isActive ? '!text-white' : '']"
              />
            </div>
            {{ link.label }}
          </template>
        </lfx-menu-button>
      </div>
      <div>
        <lfx-button
          type="outline"
          class="!rounded-full"
        >
          <lfx-icon name="rectangle-history-circle-plus" />
          Create Collection
        </lfx-button>
      </div>
    </div>
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-4xl font-secondary">
          {{ title }}
        </h1>
        <p class="text-neutral-600">
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <lfx-dropdown-select
          v-model="sortValue"
          width="20rem"
          placement="bottom-end"
          @update:model-value="emit('update:sort', $event)"
        >
          <template #trigger="{ selectedOption }">
            <lfx-dropdown-selector>
              <lfx-icon
                name="arrow-down-wide-short"
                :size="16"
              />
              <span class="hidden sm:inline">{{ selectedOption.label }}</span>
            </lfx-dropdown-selector>
          </template>

          <lfx-dropdown-item
            value="starred_desc"
            label="Featured"
          />
          <lfx-dropdown-item
            value="contributorCount_desc"
            label="Most contributors"
          />
          <lfx-dropdown-item
            value="projectCount_desc"
            label="Most projects"
          />
          <lfx-dropdown-item
            value="name_asc"
            label="Alphabetically"
          />
        </lfx-dropdown-select>

        <div>
          <lfx-tabs
            :tabs="viewTabs"
            tab-style="pill"
            :model-value="props.view"
            @update:model-value="emit('update:view', $event)"
          >
            <template #slotItem="{ option }">
              <div class="py-1">
                <lfx-icon :name="option.icon!" />
              </div>
            </template>
          </lfx-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { collectionTabs } from '../../config/collection-tabs';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxBack from '~/components/uikit/back/back.vue';
import type { CollectionType } from '~~/types/collection';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';

const props = defineProps<{
  type?: CollectionType;
  sort: string;
  view: string;
}>();
const emit = defineEmits<{
  (e: 'update:sort', value: string): void;
  (e: 'update:view', value: string): void;
}>();

const sortValue = computed({
  get: () => props.sort,
  set: (value: string) => emit('update:sort', value),
});

const route = useRoute();
const linkUrl = computed(() => collectionTabs);

const viewTabs = [
  { label: '', value: 'grid', icon: 'grid-2' },
  { label: '', value: 'list', icon: 'list-ul' },
];

const title = computed(() => {
  switch (props.type) {
    case 'curated':
      return 'Curated Collections';
    case 'community':
      return 'Community Collections';
    default:
      return 'My Collections';
  }
});
const description = computed(() => {
  switch (props.type) {
    case 'curated':
      return 'Hand-picked collections from The Linux Foundation.';
    case 'community':
      return 'Discover collections from the open source community.';
    default:
      return `Collections you've created or liked.`;
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListHeader',
};
</script>
