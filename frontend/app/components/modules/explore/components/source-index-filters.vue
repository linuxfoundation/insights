<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-row gap-2">
    <button
      type="button"
      class="c-menu-button dark"
      :class="{
        'is-active': activeSort === 'totalContributors',
      }"
      @click="sort = 'totalContributors'"
    >
      <lfx-icon
        name="people-group"
        :size="14"
      />
      Most contributors
    </button>
    <button
      type="button"
      class="c-menu-button dark"
      :class="{
        'is-active': activeSort === 'softwareValue',
      }"
      @click="sort = 'softwareValue'"
    >
      <lfx-icon
        name="circle-dollar"
        :size="14"
      />
      Software value
    </button>
    <div class="border-r border-neutral-300 mx-2" />
    <button
      type="button"
      class="c-menu-button dark"
      :class="{
        'is-active': activeType === 'horizontal',
      }"
      @click="type = 'horizontal'"
    >
      <lfx-icon
        name="layer-group"
        :size="14"
      />
      Stack
    </button>
    <button
      type="button"
      class="c-menu-button dark"
      :class="{
        'is-active': activeType === 'vertical',
      }"
      @click="type = 'vertical'"
    >
      <lfx-icon
        name="buildings"
        :size="14"
      />
      Industry
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  OSIType,
  SortType
} from '~/components/modules/open-source-index/services/osi.api.service';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const emit = defineEmits<{(e: 'update:activeType', value: OSIType): void;
  (e: 'update:activeSort', value: SortType): void;
}>();

const props = defineProps<{
  activeType: OSIType;
  activeSort: SortType;
}>();

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
  name: 'LfxExploreSourceIndexFilters'
};
</script>
