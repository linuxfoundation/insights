<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown-select
    v-model="selectedCollection"
    :width="props.width"
    :match-width="props.matchWidth"
    dropdown-class="max-h-80"
    placement="bottom-end"
  >
    <template #trigger="{ selectedOption }">
      <lfx-dropdown-selector
        :size="props.size"
        :type="props.type"
        class="!rounded-full flex items-center justify-center w-full"
      >
        <div class="flex items-center gap-2">
          <lfx-icon
            name="rectangle-history"
            :size="16"
          />
          <span class="text-sm text-neutral-900 truncate">
            {{ selectedOption.label || 'All collections' }}
          </span>
        </div>
      </lfx-dropdown-selector>
    </template>

    <template #default>
      <div class="sticky -top-1 z-10 bg-white w-full -mt-1 pt-1 flex flex-col gap-1">
        <!-- All collections option -->
        <lfx-dropdown-item
          value="all"
          label="All collections"
        />

        <lfx-dropdown-separator />

        <!-- Search input -->
        <lfx-dropdown-search
          v-model="searchQuery"
          placeholder="Search collections..."
          lazy
          class=""
        />

        <lfx-dropdown-separator />
      </div>

      <!-- Collections list -->
      <div
        v-if="isPending"
        class="py-8 flex justify-center"
      >
        <lfx-spinner />
      </div>

      <div
        v-else-if="!collections.length && searchQuery"
        class="py-4 px-3 text-sm text-neutral-500 text-center"
      >
        No collections found
      </div>

      <template v-else>
        <lfx-dropdown-item
          v-for="collection in collections"
          :key="collection.id"
          :value="collection.slug"
          :label="collection.name"
        />
      </template>
    </template>
  </lfx-dropdown-select>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSearch from '~/components/uikit/dropdown/dropdown-search.vue';
import LfxDropdownSeparator from '~/components/uikit/dropdown/dropdown-separator.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { Collection } from '~~/types/collection';
import type { Pagination } from '~~/types/shared/pagination';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    width?: string;
    matchWidth?: boolean;
    size?: 'medium' | 'small';
    type?: 'transparent' | 'filled';
  }>(),
  {
    modelValue: '',
    width: '350px',
    matchWidth: false,
    size: 'medium',
    type: 'transparent',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectedCollection = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const searchQuery = ref('');
const collections = ref<Collection[]>([]);
const isPending = ref(false);

// Fetch collections from API
const fetchCollections = async () => {
  isPending.value = true;
  try {
    const response = await COLLECTIONS_API_SERVICE.searchCollections(searchQuery.value);
    collections.value = (response as Pagination<Collection>).data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    collections.value = [];
  } finally {
    isPending.value = false;
  }
};

// Watch for search query changes
watch(
  () => searchQuery.value,
  () => {
    fetchCollections();
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionsFilter',
};
</script>
