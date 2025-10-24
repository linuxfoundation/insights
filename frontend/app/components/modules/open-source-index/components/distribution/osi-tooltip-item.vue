<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="tooltip-row"
    :class="{ 'has-software-value': !!item.softwareValue }"
  >
    <div class="name-display">
      <div class="name-icon">
        <i
          v-if="type === 'collections'"
          class="name-icon fa-light fa-people-group"
        />
        <img
          v-else
          :src="item.logoUrl"
          :alt="item.name"
        />
      </div>

      <div class="name-text">{{ item.name }}</div>
    </div>
    <div class="value-display">
      <i class="value-icon fa-light fa-people-group" />
      {{ formatNumber(item.count) }}
    </div>
    <div
      v-if="item.softwareValue"
      class="value-display"
    >
      <i class="value-icon fa-light fa-dollar-circle" />
      {{ item.softwareValue }}+
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OSIItem } from '../services/osi.template.service';
import { formatNumber } from '~/components/shared/utils/formatter';

defineProps<{
  item: OSIItem;
  type: 'collections' | 'projects';
}>();
</script>
<script lang="ts">
export default {
  name: 'LfxOSITooltipItem',
};
</script>
