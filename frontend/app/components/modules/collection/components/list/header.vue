<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-10 container pt-6 gap-10"
    :class="!props.isScrolledState ? 'pb-0' : 'pb-10 '"
  >
    <div class="flex items-center justify-between w-full pb-6 border-b border-neutral-200">
      <div class="flex items-center gap-2">
        <!-- TODO: change this to the correct route when we have the discovery page -->
        <nuxt-link
          :to="{ name: LfxRoutes.COLLECTIONS }"
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
          :to="getTabTo(link)"
          :exact="true"
          class="!py-1"
          :class="[route.name === link.route ? link.activeClass : '']"
          @click="handleTabClick(link)"
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
      <div class="flex items-center gap-4">
        <div v-if="!props.isScrolledState">
          <lfx-collection-list-controls
            v-if="!props.isEmpty || props.isLoading"
            :sort="props.sort"
            :view="props.view"
            @update:sort="emit('update:sort', $event)"
            @update:view="emit('update:view', $event)"
          />
        </div>
        <lf-create-collection-button @created="handleCreated" />
      </div>
    </div>
    <div
      v-if="props.isScrolledState"
      class="flex justify-between items-start"
    >
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-secondary font-light">
          {{ title }}
        </h1>
        <p class="text-neutral-600">
          {{ description }}
        </p>
      </div>

      <lfx-collection-list-controls
        v-if="!props.isEmpty || props.isLoading"
        :sort="props.sort"
        :view="props.view"
        @update:sort="emit('update:sort', $event)"
        @update:view="emit('update:view', $event)"
      />
    </div>
  </div>

  <lfx-collection-auth-wall
    v-if="isAuthWallOpen"
    v-model="isAuthWallOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { collectionTabs, CollectionTypeEnum } from '../../config/collection-type-config';
import type { CollectionTypesTabs } from '../../config/collection-type-config';
import LfCreateCollectionButton from '../../components/create-modal/create-button.vue';
import LfxCollectionAuthWall from '../auth-wall/collection-auth-wall.vue';
import LfxCollectionListControls from './collection-list-controls.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import type { CollectionType } from '~~/types/collection';
import LfxMenuButton from '~/components/uikit/menu-button/menu-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import type { CreateCollectionForm } from '~/components/modules/collection/config/create-collection.config';

const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const isAuthWallOpen = ref(false);

const isLockedTab = (link: CollectionTypesTabs) =>
  link.type === CollectionTypeEnum.MY_COLLECTIONS && !isAuthenticated.value;

const getTabTo = (link: CollectionTypesTabs) => (isLockedTab(link) ? undefined : { name: link.route });

const handleTabClick = (link: CollectionTypesTabs) => {
  if (isLockedTab(link)) {
    isAuthWallOpen.value = true;
  }
};

const props = defineProps<{
  type?: CollectionType;
  sort: string;
  view: string;
  isEmpty: boolean;
  isScrolledState: boolean;
  isLoading: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:sort', value: string): void;
  (e: 'update:view', value: string): void;
  (e: 'created', form: CreateCollectionForm): void;
}>();

const route = useRoute();
const linkUrl = computed(() => collectionTabs(user.value));
const title = computed(() => linkUrl.value.find((tab) => tab.type === props.type)?.detailsLabel || '');
const description = computed(() => linkUrl.value.find((tab) => tab.type === props.type)?.description || '');

const handleCreated = (form: CreateCollectionForm) => {
  emit('created', form);
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListHeader',
};
</script>
