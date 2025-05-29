<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="props.group && props.group.categoryName"
    class="fixed bg-white p-4 rounded-lg shadow-md"
  >
    <div class="osi-tooltip">
      <div class="tooltip-group">{{ groupName }}</div>
      <div class="tooltip-title">{{ props.group?.categoryName }}</div>
      <div class="flex flex-row gap-3">
        <div class="value-display">
          <i class="value-icon fa-light fa-people-group" />
          {{ formatNumber(props.group?.count) }}
        </div>
        <div
          v-if="props.group?.softwareValue"
          class="value-display"
        >
          <i class="value-icon fa-light fa-people-group" />
          {{ props.group?.softwareValue }}
        </div>
      </div>
      <hr class="mt-4">

      <div
        v-if="props.group?.collections && props.group?.collections.length > 0"
        class="flex flex-col gap-3 mt-4"
      >
        <div class="text-xs text-neutral-400 font-semibold">Top collections</div>
        <LfxOSITooltipItem
          v-for="item in props.group?.collections"
          :key="item.name"
          :item="item"
          type="collections"
        />
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <div class="text-xs text-neutral-400 font-semibold">Top projects</div>
        <LfxOSITooltipItem
          v-for="item in props.group?.projects"
          :key="item.name"
          :item="item"
          type="projects"
        />
      </div>

      <div class="flex flex-row gap-1.5 justify-center items-center text-xs text-neutral-400 mt-4">
        <lfx-icon
          name="info-circle"
          :size="14"
        />
        Sorted by {{ sortLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OSIGroup } from '../services/osi.template.service';
import LfxOSITooltipItem from './osi-tooltip-item.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  group: OSIGroup | undefined;
  sort: string;
}>();

const sortLabel = computed(() => {
  if (props.sort === 'contributorCount') {
    return 'most contributors';
  }
  return 'software value';
});

const groupName = computed(() => {
  if (!props.group?.name) {
    return '';
  }

  if (props.group?.name === 'horizontal') {
    return 'Stacks';
  }
  return 'Industry';
});
</script>
<script lang="ts">
export default {
  name: 'LfxOSITooltip'
};
</script>
