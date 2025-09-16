<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-6 justify-center items-center"
  >
    <div
      class="relative text-center"
    >
      <img
        src="/images/misc/loading-state-bg.svg"
        alt="Empty state background"
      >
      <lfx-icon
        name="chart-column"
        :size="80"
        class="text-neutral-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
    <div class="text-2xl font-secondary font-bold">
      Generate insights with AI
    </div>
    <div class="text-neutral-500 text-xs mb-10">
      Leverage LFX database to create your own custom widgets
    </div>
    <div class="flex justify-between gap-10 mx-auto">
      <div 
        v-for="(step, index) in steps" 
        :key="step.title" 
        class="flex flex-col gap-3 items-start max-w-[12.5rem]"
      >
        <div class="text-white text-xs bg-brand-500 rounded-full text-semibold px-2.5 py-1">{{ index + 1 }}</div>
        <div class="text-neutral-900 text-sm font-semibold">
          {{ step.title }}
        </div>
        <div class="text-neutral-500 text-xs">{{ step.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'

const steps = [
  {
    title: 'Describe your chart',
    description: 'Tell our AI what kind of chart you want and what data to visualize'
  },
  {
    title: 'AI generates the chart',
    description: 'Our AI will create a custom chart based on our dataset'
  },
  {
    title: 'Refine and iterate',
    description: 'Ask for changes, different chart types, or additional insights'
  }
]
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotEmptyResult'
}
</script>
