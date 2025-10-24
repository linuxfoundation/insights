<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex-row gap-2 sm:flex hidden">
    <button
      v-for="tab in sortTabs"
      :key="tab.value"
      type="button"
      class="c-menu-button c-menu-button--dark"
      :class="{
        'is-active': activeSort === tab.value,
      }"
      @click="sort = tab.value as SortType"
    >
      <lfx-icon
        :name="tab.icon"
        :size="14"
      />
      {{ tab.label }}
    </button>

    <div class="border-r border-neutral-300 mx-2" />
    <button
      v-for="tab in typeTabs"
      :key="tab.value"
      type="button"
      class="c-menu-button c-menu-button--dark"
      :class="{
        'is-active': activeType === tab.value,
      }"
      @click="type = tab.value as OSIType"
    >
      <lfx-icon
        :name="tab.icon"
        :size="14"
      />
      {{ tab.label }}
    </button>
  </div>

  <div class="sm:hidden flex flex-col gap-3">
    <lfx-tabs
      :tabs="sortTabs"
      :model-value="activeSort"
      @update:model-value="sort = $event as SortType"
    >
      <template #slotItem="{ option }">
        {{ option.label === 'Most contributors' ? 'Contributors' : option.label }}
      </template>
    </lfx-tabs>
    <lfx-tabs
      :tabs="typeTabs"
      :model-value="activeType"
      @update:model-value="type = $event as OSIType"
    >
      <template #slotItem="{ option }">
        {{ option.label }}
      </template>
    </lfx-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OSIType, SortType } from '~/components/modules/open-source-index/services/osi.api.service';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';

const emit = defineEmits<{
  (e: 'update:activeType', value: OSIType): void;
  (e: 'update:activeSort', value: SortType): void;
}>();

const props = defineProps<{
  activeType: OSIType;
  activeSort: SortType;
}>();

const sortTabs = [
  { label: 'Most contributors', value: 'totalContributors', icon: 'people-group' },
  { label: 'Software value', value: 'softwareValue', icon: 'circle-dollar' },
];
const typeTabs = [
  { label: 'Stack', value: 'horizontal', icon: 'layer-group' },
  { label: 'Industry', value: 'vertical', icon: 'buildings' },
];

const type = computed({
  get: () => props.activeType,
  set: (value) => emit('update:activeType', value),
});
const sort = computed({
  get: () => props.activeSort,
  set: (value) => emit('update:activeSort', value),
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreSourceIndexFilters',
};
</script>
