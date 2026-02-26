<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="projects.length > 0"
    class="border-y border-neutral-200 min-h-[120px] max-h-[200px] overflow-y-auto"
  >
    <div class="flex flex-col">
      <div
        v-for="project in projects"
        :key="project.slug"
        class="flex items-center gap-3 py-2.5 border-b border-neutral-200 last:border-b-0"
      >
        <!-- Project avatar -->
        <div
          class="size-6 rounded-sm border border-neutral-200 bg-white overflow-hidden flex items-center justify-center shrink-0"
        >
          <img
            v-if="project.logo"
            :src="project.logo"
            :alt="project.name"
            class="size-full object-contain"
          />
          <lfx-icon
            v-else
            name="folder"
            :size="14"
            class="text-neutral-400"
          />
        </div>

        <!-- Project name -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-5 text-neutral-900 truncate">
            {{ project.name }}
          </p>
        </div>

        <!-- Remove button -->
        <lfx-icon-button
          icon="circle-xmark"
          icon-type="light"
          size="medium"
          type="transparent"
          class="shrink-0"
          @click="$emit('remove', project.slug)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import type { CollectionProject } from '~/components/modules/collection/config/create-collection.config';

defineProps<{
  projects: CollectionProject[];
}>();

defineEmits<{
  remove: [slug: string];
}>();
</script>

<script lang="ts">
export default {
  name: 'LfSelectedProjectsList',
};
</script>
