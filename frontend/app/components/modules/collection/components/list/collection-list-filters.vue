<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-4">
    <lfx-collection-list-category
      v-model="category"
      :category-groups-vertical="categoryGroupsVertical"
      :category-groups-horizontal="categoryGroupsHorizontal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CategoryGroupOptions } from '~/components/modules/collection/services/collections.api.service';
import LfxCollectionListCategory from '~/components/modules/collection/components/list/filters/collection-list-filters-category.vue';

const props = defineProps<{
  category: string;
  categoryGroupsVertical: CategoryGroupOptions[];
  categoryGroupsHorizontal: CategoryGroupOptions[];
}>();

const emit = defineEmits<{ (e: 'update:category', value: string): void }>();

const category = computed({
  get: () => props.category,
  set: (value: string) => emit('update:category', value),
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListFilters',
};
</script>
