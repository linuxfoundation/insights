<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="connected.length > 0"
    class="flex flex-col gap-3"
  >
    <div class="flex items-center">
      <div class="border-b border-neutral-200 flex-grow" />
      <div class="px-4 flex items-center gap-2">
        <p class="text-xs font-semibold leading-5 text-neutral-400">
          Data sources
        </p>
        <lfx-tooltip>
          <template #content>
            <p class="text-center">
              The connected data sources used to<br> generate insights for this project
            </p>
          </template>
          <lfx-icon
            name="question-circle"
            :size="13"
            class="text-neutral-400"
          />
        </lfx-tooltip>
      </div>
      <div class="border-b border-neutral-200 flex-grow" />
    </div>
    <div class="flex flex-wrap items-center gap-1.5">
      <lfx-tag
        v-for="platform of connected"
        :key="platform.platform"
        type="outline"
        size="small"
      >
        <img
          :src="platform.image"
          :alt="platform.label"
          class="w-3.5 h-3.5 object-contain"
        >
        {{ platform.label }}
      </lfx-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import {storeToRefs} from 'pinia';
import {computed} from "vue";
import {useProjectStore} from '~~/app/components/modules/project/store/project.store';
import {platforms} from "~/config/platforms";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxTag from "~/components/uikit/tag/tag.vue";

const {project} = storeToRefs(useProjectStore())

const connected = computed(() => {
  const platformList = (project.value?.connectedPlatforms || [])
      .map((platform) => platform.split('-').at(0) || platform);
  const uniquePlatforms = [...new Set(platformList)];
  return uniquePlatforms
      .map((platform) => ({
        platform,
        ...platforms[platform],
      }))
      .filter((platform) => !!platform.label)
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSectionConnectedPlatforms'
};
</script>
