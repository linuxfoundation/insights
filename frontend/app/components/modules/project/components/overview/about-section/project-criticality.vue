<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card
    v-if="project?.score && project?.score > 0"
    class="p-5"
  >
    <div class="flex justify-between pb-8 gap-3">
      <div class="max-w-50">
        <h3 class="text-sm leading-5 font-semibold mb-1">
          Project criticality
        </h3>
        <p class="text-xs leading-4 text-neutral-400">
          Based on OpenSSF Criticality Score project.
          <a
            href="/docs/"
            target="_blank"
            class="text-brand-500"
          >Learn more</a>
        </p>
      </div>
      <div v-if="topRank">
        <lfx-tooltip
          :content="
            `${project?.name} belongs to the ${topRank} most critical open source projects`"
        >
          <img
            :src="`/images/criticality/top-${topRank}.svg`"
            :alt="`Top ${topRank} criticality`"
            class="min-w-14"
          >
        </lfx-tooltip>
      </div>
    </div>
    <div class="py-1 relative">
      <div class="h-1 w-full rounded-full bg-gradient-to-r from-white to-brand-500" />
      <div
        class="absolute -top-1  -ml-1"
        :style="{left: `calc((100% - 12px) * ${project?.score || 1})`}"
      >
        <lfx-tooltip placement="top">
          <template #content>
            <span>Score: </span>{{project?.score || 1}}
          </template>
          <div
            class="border-4 border-white rounded-full w-5 h-5 bg-brand-500"
          />
        </lfx-tooltip>
      </div>

    </div>
    <div class="pt-1 flex justify-between">
      <p class="text-xs leading-4 font-semibold text-neutral-400">
        Least critical
      </p>
      <p class="text-xs leading-4 font-semibold text-neutral-400">
        Most critical
      </p>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import LfxCard from "~/components/uikit/card/card.vue";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";

const { project } = storeToRefs(useProjectStore())

const topRank = computed(() => {
  const rank = project.value?.rank;
  if (!rank) return 0;
  if (rank <= 10) return 10;
  if (rank <= 100) return 100;
  if (rank <= 500) return 500;
  if (rank <= 1000) return 1000;
  if (rank <= 5000) return 5000;
  if (rank <= 10000) return 10000;
  return 0;
})
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCriticality'
};
</script>
