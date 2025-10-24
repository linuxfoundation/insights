<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="sticky -top-1 z-10 bg-white flex flex-col gap-1 -mt-1 pt-1">
    <lfx-dropdown-search v-model="search" />
    <lfx-dropdown-separator />
  </div>
  <div
    v-if="noResults"
    class="py-8 text-center italic text-body-2 text-neutral-400"
  >
    No results found
  </div>
  <template
    v-for="group of categoryGroups"
    :key="group.id"
  >
    <lfx-dropdown-item
      v-if="group.categories.length"
      :value="group.value"
      :label="group.name"
    >
      {{ group.name }}
    </lfx-dropdown-item>
    <lfx-dropdown-item
      v-for="category of group.categories"
      :key="category.id"
      :value="category.id"
      :label="category.name"
      class="!pl-10"
    />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxDropdownSearch from '~/components/uikit/dropdown/dropdown-search.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSeparator from '~/components/uikit/dropdown/dropdown-separator.vue';
import type { CategoryGroupOptions } from '~/components/modules/collection/services/collections.api.service';

const props = defineProps<{
  options: CategoryGroupOptions[];
}>();

const search = ref('');

const categoryGroups = computed(() =>
  (props.options || []).map((cg) => ({
    ...cg,
    categories: cg.categories.filter((c) =>
      c.name.toLowerCase().includes(search.value.toLowerCase()),
    ),
  })),
);

const noResults = computed(
  () => search.value && categoryGroups.value.every((cg) => cg.categories.length === 0),
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListCategoryOptions',
};
</script>
