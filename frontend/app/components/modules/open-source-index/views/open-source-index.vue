<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container pt-8">
    <h1 class="text-heading-1 font-semibold pb-4">Open Source Index</h1>

    <div
      class="w-full h-[500px]"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <LfxChart :config="config" />
    </div>
    <div class="">
      <LfxOSITooltip
        ref="tooltipRef"
        :group="selectedGroup"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { OSIGroup } from '../services/osi.template.service';
import LfxOSITooltip from '../components/osi-tooltip.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import {
  getTreeMapConfig,
  type TreeLabelFormatterParams,
  type TreeMapData
} from '~/components/uikit/chart/configs/tree-map.chart';
import { mockTreeMap } from '~~/server/mocks/tree-map.mock';

const groupName = ref('Stack');
const tooltipRef = ref<InstanceType<typeof LfxOSITooltip>>();
const selectedGroup = ref<OSIGroup | undefined>(undefined);

const sampleData: TreeMapData[] = mockTreeMap;

const tooltip = (info: TreeLabelFormatterParams) => {
  const { name, value } = info;
  const collection = sampleData.find((item) => item.name === name);
  const projects = collection?.topProjects;

  const group: OSIGroup = {
    name: groupName.value || '',
    categoryName: collection?.name || '',
    count: value[0] || 0,
    softwareValue: collection?.softwareValue || '',
    projects: projects?.map((project) => ({
      name: project.name,
      count: project.count,
      softwareValue: project.softwareValue || '',
      logoUrl: project.logoUrl
    })) || [],
    collections: collection?.topCollections?.map((collection) => ({
      name: collection.name,
      count: collection.count,
      softwareValue: collection.softwareValue || '',
      icon: 'fa-light fa-people-group'
    })) || []
  }

  if(selectedGroup.value?.categoryName !== group.categoryName) {
    selectedGroup.value = group;
  }

  // This is the original tooltip template
  // However, this is glitching the images because it refetches the images every time
  // the user moves the mouse over the boxes
  // const template = getOSITooltipTemplate(group);
  // return template;

  // We're returning empty so that the tooltip is not rendered
  return '';
};
const config = getTreeMapConfig(sampleData, tooltip);

/**
 * This is a hack to move the tooltip to the correct position
 * It's not the best solution, but it's the only way I can think of to move the tooltip
 * to the correct position without it glitching
 */
const handleMouseMove = (event: MouseEvent) => {
  const elem = tooltipRef.value?.$el;
  const offset = 10;

  if (elem && typeof elem.getBoundingClientRect === 'function') {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    const { width, height } = elem.getBoundingClientRect();
    const x = (clientX + width) > innerWidth ? clientX - width - offset : clientX + offset;
    const y = clientY + height > innerHeight ? clientY - height - offset : clientY + offset;

    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
  }
};

const handleMouseLeave = () => {
  selectedGroup.value = undefined;
}
</script>

<script lang="ts">
export default {
  name: 'LfxOpenSourceIndex'
};
</script>
