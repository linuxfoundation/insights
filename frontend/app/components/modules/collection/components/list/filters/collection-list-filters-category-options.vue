<template>
  <div
    class="sticky -top-1 z-10 bg-white flex flex-col gap-1 -mt-1 pt-1"
  >
    <lfx-dropdown-search
      v-model="search"
      :lazy="true"
    />
    <lfx-dropdown-separator />
  </div>
  <template
    v-for="group of (data?.data || [])"
    :key="group.id"
  >
    <lfx-dropdown-group-title v-if="group.categories.length">
      {{group.name}}
    </lfx-dropdown-group-title>
    <lfx-dropdown-item
      v-for="category of group.categories"
      :key="category.id"
      :value="category.id"
      :label="category.name"
    />
  </template>
</template>

<script setup lang="ts">
import {useFetch} from "nuxt/app";
import LfxDropdownSearch from "~/components/uikit/dropdown/dropdown-search.vue";
import LfxDropdownGroupTitle from "~/components/uikit/dropdown/dropdown-group-title.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import type {Pagination} from "~~/types/shared/pagination";
import type {CategoryGroup} from "~~/types/category";

const props = defineProps<{
  type: 'vertical' | 'horizontal';
}>();

const search = ref('');

const { data } = await useFetch<Pagination<CategoryGroup>>(
    () => `/api/category`,
    {
      params: {
        search,
        type: props.type,
      },
    }
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListCategoryOptions'
}
</script>
