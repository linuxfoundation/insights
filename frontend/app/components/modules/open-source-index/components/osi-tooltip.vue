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
      <div class="tooltip-group">{{ props.group?.name }}</div>
      <div class="tooltip-title">{{ props.group?.categoryName }}</div>
      <div class="flex flex-row gap-3">
        <div class="value-display">
          <i class="value-icon fa-light fa-people-group" />
          {{ props.group?.count }}
        </div>
        <div class="value-display">
          <i class="value-icon fa-light fa-people-group" />
          {{ props.group?.softwareValue }}
        </div>
      </div>
      <hr class="mt-4">

      <div
        v-if="props.group?.collections"
        class="flex flex-col gap-3 mt-4"
      >
        <div class="text-xs text-neutral-400 font-semibold">Top collections</div>
        <div
          v-for="item in props.group?.collections"
          :key="item.name"
          class="tooltip-row"
        >
          <div class="name-display">
            <div class="name-icon">
              <i class="name-icon fa-light fa-people-group" />
            </div>
            <div class="name-text">{{ item.name }}</div>
          </div>
          <div class="value-display">
            <i class="value-icon fa-light fa-people-group" />
            {{ item.count }}
          </div>
          <div class="value-display">
            <i class="value-icon fa-light fa-dollar-circle" />
            {{ item.softwareValue }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <div class="text-xs text-neutral-400 font-semibold">Top projects</div>
        <div
          v-for="item in props.group?.projects"
          :key="item.name"
          class="tooltip-row"
        >
          <div class="name-display">
            <div class="name-icon">
              <img
                :src="item.logoUrl"
                :alt="item.name"
              >
            </div>
            <div class="name-text">{{ item.name }}</div>
          </div>
          <div class="value-display">
            <i class="value-icon fa-light fa-people-group" />
            {{ item.count }}
          </div>
          <div class="value-display">
            <i class="value-icon fa-light fa-dollar-circle" />
            {{ item.softwareValue }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { OSIGroup } from '../services/osi.template.service';

const props = defineProps<{
  group: OSIGroup | undefined;
}>();
</script>
<script lang="ts">
export default {
  name: 'LfxOSITooltip'
};
</script>
