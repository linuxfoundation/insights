<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="w-full h-[700px]"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <LfxChart
      :config="config"
      @click="handleChartClick"
    />
  </div>
  <div class="">
    <LfxOSITooltip
      ref="tooltipRef"
      :group="selectedGroup"
      :sort="props.sort"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ECElementEvent } from 'echarts';
import {useRouter} from "nuxt/app";
import type { OSIGroup } from '../services/osi.template.service';
import LfxOSITooltip from "./osi-tooltip.vue";
import LfxChart from '~/components/uikit/chart/chart.vue';
import {
  getTreeMapConfig,
  type TreeLabelFormatterParams,
  type TreeMapData
} from '~/components/uikit/chart/configs/tree-map.chart';

const router = useRouter();

const tooltipRef = ref<InstanceType<typeof LfxOSITooltip>>();
const selectedGroup = ref<OSIGroup | undefined>(undefined);

const props = defineProps<{
  sort: string;
  data: TreeMapData[];
}>();

const tooltip = (info: TreeLabelFormatterParams): string => {
  const { name, value } = info;

  const collection = props.data.find((item) => item.name === name);
  const projects = collection?.topProjects;

  const group: OSIGroup = {
    name: collection?.type || '',
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
const config = computed(() => getTreeMapConfig(props.data, tooltip));

/**
 * This is a hack to move the tooltip to the correct position
 * It's not the best solution, but it's the only way I can think of to move the tooltip
 * to the correct position without it glitching
 */
const handleMouseMove = (event: MouseEvent) => {
  const elem = tooltipRef.value?.$el;
  const offset = 10;
  const topOffset = 80;

  if (elem && typeof elem.getBoundingClientRect === 'function') {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    const { width, height } = elem.getBoundingClientRect();

    // Keep x position within viewport bounds
    let x = clientX + offset;
    if (x + width > innerWidth) {
      x = clientX - width - offset;
    }
    if (x < 0) {
      x = offset;
    }

    // Keep y position within viewport bounds
    let y = clientY + offset;
    if ((y + height) > (innerHeight + topOffset)) {
      y = (clientY - height - offset) + topOffset;
    }
    if (y < 0) {
      y = offset + topOffset;
    }

    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
  }
};

const handleMouseLeave = () => {
  selectedGroup.value = undefined;
}

const handleChartClick = (params: ECElementEvent) => {
  if (params.componentSubType === 'treemap' && params.componentType === 'series' && params.dataIndex > 0) {
    const data = params.data as TreeMapData;

    if (data.id && data.link) {
      router.push(data.link);
    }
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxOSIChart'
};
</script>
