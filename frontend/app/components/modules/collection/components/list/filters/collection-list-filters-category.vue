<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown-select
    v-model="model"
    width="21.25rem"
    dropdown-class="!overflow-auto sm:!overflow-visible"
  >
    <template #trigger="{selectedOption}">
      <lfx-dropdown-selector type="filled">
        <lfx-icon
          name="arrow-down-wide-short"
          :size="16"
        />
        {{ selectedOption.value === 'all' ? selectedOption.label : getSelectedLabel(selectedOption.value) }}
        {{selectedOption.value.startsWith('group-') ? '(all sub-stacks)' : ''}}
      </lfx-dropdown-selector>
    </template>

    <lfx-dropdown-item
      value="all"
      label="All stacks & industries"
    />
    <lfx-dropdown-separator />

    <lfx-dropdown-submenu
      width="21.5rem"
      name="stack"
      label="Stacks"
    >
      <template #item>
        <lfx-icon
          name="layer-group"
          :size="16"
        />
        Stacks
      </template>
      <lfx-collection-list-category-options :options="categoryGroupsHorizontal" />
    </lfx-dropdown-submenu>

    <lfx-dropdown-submenu
      width="21.5rem"
      name="industry"
      label="Industries"
    >
      <template #item>
        <lfx-icon
          name="buildings"
          :size="16"
        />
        Industries
      </template>

      <lfx-collection-list-category-options :options="categoryGroupsVertical" />
    </lfx-dropdown-submenu>
  </lfx-dropdown-select>
</template>

<script setup lang="ts">

import {computed} from "vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import LfxDropdownSubmenu from "~/components/uikit/dropdown/dropdown-submenu.vue";
import LfxCollectionListCategoryOptions
  from "~/components/modules/collection/components/list/filters/collection-list-filters-category-options.vue";
import type { CategoryGroupOptions} from "~/components/modules/collection/services/collections.api.service";

const props = defineProps<{
  modelValue: string;
  categoryGroupsVertical: CategoryGroupOptions[],
  categoryGroupsHorizontal: CategoryGroupOptions[]
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: string): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const allCategoryGroups = computed(() => [
  ...props.categoryGroupsVertical,
  ...props.categoryGroupsHorizontal,
  ...props.categoryGroupsVertical.flatMap((cg) => cg.categories.map((c) => ({id: c.id, name: c.name, value: c.id}))),
  ...props.categoryGroupsHorizontal.flatMap((cg) => cg.categories.map((c) => ({id: c.id, name: c.name, value: c.id})))
]);

const getSelectedLabel = (value: string) => {
  const categoryGroup = allCategoryGroups.value.find((cg) => cg.value === value);
  return categoryGroup?.name || '';
};

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListCategory'
}
</script>
