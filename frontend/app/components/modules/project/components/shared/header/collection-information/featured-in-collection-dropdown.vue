<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="max-w-[320px] max-h-[400px] flex flex-col">
    <!-- Header - sticky -->
    <div class="sticky top-0 bg-white z-10 flex items-center gap-3 pt-4 px-3 pb-2">
      <span class="text-xs text-neutral-500"> {{ publicCount }} public · {{ privateCount }} private </span>
      <div class="flex-1 h-px bg-neutral-100" />
    </div>

    <!-- Scrollable list -->
    <div class="flex-1 overflow-y-auto flex flex-col px-3">
      <div
        v-for="collection in collections"
        :key="collection.slug"
        class="flex items-center gap-3 py-2 pl-2 pr-4 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-neutral-50"
        @click="navigateToCollection(collection.slug)"
      >
        <lfx-avatar
          v-if="collection.logo"
          :src="collection.logo"
          type="organization"
          size="small"
        />
        <div
          v-else
          class="border border-neutral-200 rounded-sm size-6 flex items-center justify-center"
        >
          <lfx-icon
            name="rectangle-history"
            :size="12"
            class="text-neutral-400"
          />
        </div>
        <span class="text-xs font-medium text-neutral-900 truncate flex-1">
          {{ collection.name }}
        </span>
      </div>
    </div>

    <!-- Footer - sticky -->
    <div class="sticky bottom-0 bg-white z-10 mx-3 pt-2 pb-2 border-t border-neutral-200">
      <lfx-button
        type="transparent"
        class="w-full flex items-center justify-center"
        @click="handleAddToCollection"
      >
        <lfx-icon
          name="rectangle-history-circle-plus"
          type="light"
          :size="12"
        />
        <span>Add to collection</span>
      </lfx-button>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ProjectCollectionItem } from '~/components/modules/project/services/project.api.service';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxButton from '~/components/uikit/button/button.vue';

defineProps<{
  collections: ProjectCollectionItem[];
  publicCount: number;
  privateCount: number;
}>();

const emit = defineEmits<{
  (e: 'add-to-collection'): void;
}>();

const router = useRouter();

const navigateToCollection = (slug: string) => {
  router.push({ name: LfxRoutes.COLLECTION, params: { slug } });
};

const handleAddToCollection = () => {
  emit('add-to-collection');
};
</script>

<script lang="ts">
export default {
  name: 'LfxFeaturedInCollectionDropdown',
};
</script>
