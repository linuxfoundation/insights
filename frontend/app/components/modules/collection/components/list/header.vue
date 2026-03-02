<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-10 container pt-6 pb-10 gap-10">
    <div class="flex items-center justify-between w-full pb-6 border-b border-neutral-200">
      <div class="flex items-center gap-2">
        <!-- TODO: change this to the correct route when we have the discovery page -->
        <nuxt-link
          :to="{ name: LfxRoutes.EXPLORE }"
          class="ease-linear transition-all"
        >
          <lfx-icon-button
            type="transparent"
            icon="angle-left"
            class=""
          />
        </nuxt-link>

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
          v-if="canCreateCollection"
          type="outline"
          class="!rounded-full"
          @click="isCreateCollectionModalOpen = true"
        >
          <lfx-icon name="rectangle-history-circle-plus" />
          Create Collection
        </lfx-button>
      </div>
    </div>
    <div class="flex justify-between items-start">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-secondary font-light">
          {{ title }}
        </h1>
        <p class="text-neutral-600">
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-4">
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

  <lf-create-collection-modal
    v-if="isCreateCollectionModalOpen"
    v-model="isCreateCollectionModalOpen"
    @update:model-value="handleCreateCollectionUpdate"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'nuxt/app';
import { collectionTabs } from '../../config/collection-type-config';
import LfCreateCollectionModal from '../../components/create-modal/create-collection-modal.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import type { CollectionType } from '~~/types/collection';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
// TODO: remove this once we have everything done and tested
import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

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

// TODO: remove this once we have everything done and tested
const canCreateCollection = computed(() => {
  return user.value?.isLfInsightsTeamMember || false;
});

const isCreateCollectionModalOpen = ref(false);

const route = useRoute();
const linkUrl = computed(() => collectionTabs(user.value));

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

const handleCreateCollectionUpdate = () => {
  isCreateCollectionModalOpen.value = false;
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListHeader',
};
</script>
